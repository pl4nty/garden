---
dg-publish: true
---
Kaitai Struct is a declarative language used to describe various binary data structures, laid out in files or in memory: i.e. binary file formats, network stream packet formats, etc.

The main idea is that a particular format is described in Kaitai Struct language (`.ksy` file) and then can be compiled with `ksc` into source files in one of the supported programming languages. These modules will include a generated code for a parser that can read the described data structure from a file or stream and give access to it in a nice, easy-to-comprehend API.

It's been great at iterating on simple parsers for proprietary formats like [[InstallShield|InstallShield]] - I actually first heard about it from a blog post on [[Delivery Optimization|Delivery Optimization]]'s wire protocol.  The [web IDE](https://ide.kaitai.io/) is really powerful until you need anything complex (like custom decryption for Installshield...). I ended up porting parts of it to VSCode's Hex Editor extension. Lack of TypeScript support was annoying, [Avery was working on it](https://github.com/kaitai-io/kaitai_struct/issues/542#issuecomment-1447993111) but nothing seems finished so far. And the maintainers seem to have a pretty high bar for PRs