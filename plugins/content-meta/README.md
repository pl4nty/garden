# @quartz-community/content-meta

Displays content metadata such as creation date and reading time.

## Installation

```bash
npx quartz plugin add github:quartz-community/content-meta
```

## Usage

```yaml title="quartz.config.yaml"
plugins:
  - source: github:quartz-community/content-meta
    enabled: true
    layout:
      position: beforeBody
      priority: 20
```

For advanced use cases, you can override in TypeScript:

```ts title="quartz.ts (override)"
import * as ExternalPlugin from "./.quartz/plugins";

ExternalPlugin.ContentMeta({
  showReadingTime: true,
  showComma: true,
});
```

## Configuration

| Option            | Type      | Default | Description                                        |
| ----------------- | --------- | ------- | -------------------------------------------------- |
| `showReadingTime` | `boolean` | `true`  | Whether to display the estimated reading time.     |
| `showComma`       | `boolean` | `true`  | Whether to display a comma between metadata items. |

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/plugins/ContentMeta) for more information.

## License

MIT
