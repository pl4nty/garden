# @tplant/featured

A small Quartz component that renders a **Featured** list of hand-picked posts
on the homepage — each entry shows the post title (linked) and its date — plus a
"See N more →" link to the posts folder.

It only renders on the site index (`slug === "index"`); on every other page it
renders nothing, so it's safe to place in a shared layout slot such as
`afterBody`.

## Options

| Option     | Type       | Default      | Description                                                                 |
| ---------- | ---------- | ------------ | --------------------------------------------------------------------------- |
| `title`    | `string`   | `"Featured"` | Heading shown above the list.                                               |
| `posts`    | `string[]` | `[]`         | Ordered list of post slugs to feature, e.g. `posts/my-post`.                |
| `folder`   | `string`   | `"posts"`    | Folder slug the posts live in; drives the "see N more" count and the link.  |
| `showMore` | `boolean`  | `true`       | Whether to render the "See N more →" link.                                  |

The "See N more" count is the number of published posts in `folder` that aren't
already featured (the folder's own index page is excluded), so it stays correct
as posts are added or removed.

## Example

```yaml
- source: ./plugins/featured
  enabled: true
  options:
    title: Featured
    folder: posts
    posts:
      - posts/finding-an-unreleased-windows-feature---tenant-restrictions-v2-(trv2)
      - posts/building-australia's-largest-highschool-ctf
      - posts/use-a-custom-outlook.com-email-address-without-godaddy
  layout:
    position: afterBody
    priority: 5
```

## Building

`dist/` is hand-authored to mirror what `tsup` would emit (the inlined preact
jsx-runtime keeps the component free of module-resolution surprises). Keep it in
sync with `src/` when editing.
