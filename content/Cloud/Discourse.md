---
dg-publish: true
---
[Source](https://meta.discourse.org/t/discourse-rss-feeds-list/264134)

Here’s a list of most of the available RSS feeds in Discourse.

RSS links that contain an ID (categories, topics, badges, etc.) are defined by their ID. The links won’t break if the slug part of the URL changes, but the slug is still mandatory.

For example, these links all lead to the same RSS feed:

- `https://meta.discourse.org/t/events-plugin/69776.rss`
- `https://meta.discourse.org/t/a-random-slug/69776.rss`
- `https://meta.discourse.org/t/-/69776.rss`

| **Description** | **URL**                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Badges          | `https://meta.discourse.org/badges/[id]/[badge_name].rss`                                                                 |
| Categories      | `https://meta.discourse.org/c/[category_slug]/[id].rss`                                                                   |
| Groups          | `https://meta.discourse.org/groups/[group_name]/mentions.rss` or `https://meta.discourse.org/g/[group_name]/mentions.rss` |
| Posts           | `https://meta.discourse.org/posts.rss`                                                                                    |
| Tags            | `https://meta.discourse.org/tag/[tag_name].rss`                                                                           |

## Topics

| **Description**         | **URL**                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| All                     | `https://meta.discourse.org/top/all.rss`                                                                                           |
| Yearly                  | `https://meta.discourse.org/top/yearly.rss`                                                                                        |
| Quarterly               | `https://meta.discourse.org/top/quarterly.rss`                                                                                     |
| Monthly                 | `https://meta.discourse.org/top/monthly.rss`                                                                                       |
| Daily                   | `https://meta.discourse.org/top/daily.rss`                                                                                         |
| Top topics (for a user) | `https://meta.discourse.org/top.rss`                                                                                               |
| Latest Topics           | `https://meta.discourse.org/latest.rss`                                                                                            |
| Single Topic            | `https://meta.discourse.org/t/[topic_slug]/[id].rss`                                                                               |
| User's Posts            | `https://meta.discourse.org/users/[username]/activity.rss` or `https://meta.discourse.org/u/[username]/activity.rss`               |
| User's Topics           | `https://meta.discourse.org/users/[username]/activity/topics.rss` or `https://meta.discourse.org/u/[username]/activity/topics.rss` |
