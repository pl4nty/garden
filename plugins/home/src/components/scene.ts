// Where each plant stands in the garden.
//
// The ground is a plane seen from a little above. A place on it is `x` (0 to
// 100 across the picture) and `z` (0 at the horizon, 1 nearest the viewer).
// Notes from one folder grow together in a bed: an ellipse on the ground.
// There are two plantings, one for a wide screen and one for an upright phone,
// where a bed keeps only its most recently tended notes.

export interface Spot {
  // position in the picture, in percent
  x: number
  y: number
  // depth, 0 far to 1 near
  z: number
  // scale of the plant at this depth
  s: number
}

// centre x, centre z, radius in x, radius in z
type Ellipse = [number, number, number, number]

export interface Bed {
  // folder slug prefixes of the notes that grow here
  folders: string[]
  // the folder page the bed's label links to
  href: string
  label: string
  wide: Ellipse
  tall: Ellipse
  // how many of its plants an upright phone shows
  keep: number
}

// The order is the order a keyboard visits the beds in.
export const BEDS: Bed[] = [
  {
    folders: ["posts/"],
    href: "posts/",
    label: "Posts",
    wide: [40, 0.9, 14, 0.075],
    tall: [36, 0.9, 26, 0.065],
    keep: 5,
  },
  {
    folders: ["notes/microsoft/windows/"],
    href: "notes/microsoft/windows/",
    label: "Windows",
    wide: [24, 0.43, 14, 0.12],
    tall: [30, 0.42, 23, 0.085],
    keep: 5,
  },
  {
    folders: ["notes/microsoft/intune/"],
    href: "notes/microsoft/intune/",
    label: "Intune",
    wide: [8, 0.76, 5.5, 0.07],
    tall: [14, 0.66, 9, 0.05],
    keep: 2,
  },
  {
    folders: [
      "notes/microsoft/defender/",
      "notes/microsoft/entra/",
      "notes/microsoft/exchange/",
      "notes/microsoft/",
    ],
    href: "notes/microsoft/",
    label: "Microsoft",
    wide: [47, 0.1, 15, 0.07],
    tall: [56, 0.12, 30, 0.06],
    keep: 4,
  },
  {
    folders: ["notes/microsoft/azure/"],
    href: "notes/microsoft/azure/",
    label: "Azure",
    wide: [62, 0.31, 5, 0.05],
    tall: [84, 0.3, 9, 0.04],
    keep: 2,
  },
  {
    folders: ["notes/cloud/"],
    href: "notes/cloud/",
    label: "Cloud",
    wide: [82, 0.27, 9, 0.09],
    tall: [74, 0.52, 15, 0.06],
    keep: 3,
  },
  {
    folders: ["notes/projects/"],
    href: "notes/projects/",
    label: "Projects",
    wide: [66, 0.63, 6, 0.06],
    tall: [50, 0.7, 11, 0.045],
    keep: 2,
  },
  {
    folders: ["notes/hardware/"],
    href: "notes/hardware/",
    label: "Hardware",
    wide: [88, 0.8, 7, 0.08],
    tall: [82, 0.84, 12, 0.055],
    keep: 2,
  },
  {
    folders: ["notes/"],
    href: "notes/",
    label: "Notes",
    wide: [10, 0.16, 5, 0.05],
    tall: [16, 0.2, 10, 0.04],
    keep: 1,
  },
]

// The bed a note grows in: the one with the longest matching folder prefix.
export function bedOf(slug: string): Bed | undefined {
  let best: Bed | undefined
  let length = 0
  for (const bed of BEDS) {
    for (const folder of bed.folders) {
      if (slug.startsWith(folder) && folder.length > length) {
        best = bed
        length = folder.length
      }
    }
  }
  return best
}

// The horizon and the foot of the planted ground, in percent of the picture.
const WIDE = { top: 30, span: 59, far: 0.5, near: 1.45 }
const TALL = { top: 31, span: 55, far: 0.45, near: 1.15 }

const project = (frame: typeof WIDE, x: number, z: number): Spot => ({
  x,
  y: frame.top + frame.span * Math.pow(z, 0.85),
  z,
  s: frame.far + (frame.near - frame.far) * z,
})

// `count` places in an ellipse. Sunflower spacing keeps them apart without a
// grid; `phase` turns the pattern so that no two beds match.
export function scatter(ellipse: Ellipse, count: number, phase: number, tall = false): Spot[] {
  const [cx, cz, rx, rz] = ellipse
  const frame = tall ? TALL : WIDE
  const spots: Spot[] = []
  for (let k = 0; k < count; k++) {
    const r = count === 1 ? 0 : Math.sqrt((k + 0.5) / count)
    const a = k * 2.39996 + phase
    const z = Math.max(0.02, Math.min(1, cz + rz * r * Math.sin(a)))
    spots.push(project(frame, cx + rx * r * Math.cos(a), z))
  }
  return spots
}

// The place of a bed's label: on the ground just in front of the bed.
export function labelSpot(ellipse: Ellipse, tall = false): Spot {
  const [cx, cz, , rz] = ellipse
  return project(tall ? TALL : WIDE, cx, Math.min(1, cz + rz + 0.035))
}
