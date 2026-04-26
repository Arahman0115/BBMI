# ChartsPanel.tsx — Deep Dive

> Location: `redcap-vis/src/components/ChartsPanel.tsx`
> Library: [Recharts](https://recharts.org) v3 (already in package.json)

---

## Table of Contents

1. [What the file does at a high level](#1-what-the-file-does-at-a-high-level)
2. [Imports explained](#2-imports-explained)
3. [Constants](#3-constants)
4. [Data transformation functions](#4-data-transformation-functions)
5. [Sub-components](#5-sub-components)
6. [The main component: ChartsPanel](#6-the-main-component-chartspanel)
7. [Recharts primitives used](#7-recharts-primitives-used)
8. [How BarChart works](#8-how-barchart-works)
9. [How PieChart / donut works](#9-how-piechart--donut-works)
10. [Custom Tooltip pattern](#10-custom-tooltip-pattern)
11. [The `donut` inline helper](#11-the-donut-inline-helper)
12. [Patterns worth remembering](#12-patterns-worth-remembering)
13. [How to add a new chart](#13-how-to-add-a-new-chart)

---

## 1. What the file does at a high level

`ChartsPanel` takes an array of `DonorRecord` objects (the currently filtered dataset)
and renders a horizontal, scrollable row of chart cards summarising the cohort across
seven dimensions: age, study source, sex, Braak stage, Thal phase, APOE genotype, and
MAPT haplotype. It also renders placeholder cards for future chart types.

All data processing happens inside the component — no external state management needed.
The component is purely presentational: give it data, it gives you charts.

---

## 2. Imports explained

```tsx
import React from 'react'
```
Standard React import. Required even when JSX is the only thing being written, because
JSX compiles to `React.createElement(...)` calls under the hood.

```tsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
```
Recharts uses a **compositional API**: you build charts by nesting child components
inside a parent chart component, similar to how HTML elements nest. Each import is one
building block:

| Import      | Role |
|-------------|------|
| `BarChart`  | The SVG canvas and coordinate system for bar charts |
| `Bar`       | A single series of bars drawn inside `BarChart` |
| `XAxis`     | The horizontal axis — handles labels, ticks, line |
| `YAxis`     | The vertical axis |
| `Tooltip`   | The floating popup on hover |
| `PieChart`  | The SVG canvas for pie / donut charts |
| `Pie`       | The actual ring/slice shape |
| `Cell`      | Used to colour individual slices differently |

```tsx
import { DonorRecord } from '../types'
```
The TypeScript type for a single brain bank record. Used to type the `data` prop and
the callback arguments in `countBy` / `ageBins`.

---

## 3. Constants

```tsx
const PIE_COLORS = ['#0068b1', '#34a853', '#fbbc04', '#ea4335', '#9c5fd1', '#00bcd4', '#ff7043']
```
A palette of 7 colours (blue, green, amber, red, purple, cyan, orange). Used by the
`Cell` components inside every pie chart. When there are more slices than colours the
index wraps around with `i % PIE_COLORS.length`.

```tsx
const TICK  = { fill: '#4a5a6a', fontSize: 10 } as const
const ALINE = { stroke: 'rgba(255,255,255,0.06)' } as const
```
Style objects that are spread onto Recharts axis props. Defined once here to avoid
repeating the same object literal six times across all chart instances.

`as const` tells TypeScript to treat these as read-only literal types rather than
general `string`/`number` types — useful for avoiding accidental mutation.

---

## 4. Data transformation functions

### `countBy`

```tsx
const countBy = (data: DonorRecord[], key: (r: DonorRecord) => string) => {
  const m: Record<string, number> = {}
  data.forEach(r => { const v = key(r); m[v] = (m[v] || 0) + 1 })
  return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}
```

**What it does:** Takes an array of records and a *key extractor* function, then
returns an array of `{ name, value }` objects sorted by frequency (highest first).
This is the format Recharts expects for pie charts.

**Step by step:**
1. `m` is a plain object used as a frequency map — keys are category strings, values
   are counts.
2. `forEach` loops every record, calls `key(r)` to get the category string for that
   record, then increments the count. `m[v] || 0` handles the first occurrence (where
   `m[v]` would otherwise be `undefined`, causing `undefined + 1 = NaN`).
3. `Object.entries(m)` converts `{ Male: 8, Female: 7 }` into
   `[['Male', 8], ['Female', 7]]`, which is then `.map`ped into the Recharts shape.
4. `.sort((a, b) => b.value - a.value)` puts the most common category first.

**How it's called:**
```tsx
countBy(data, r => r.sex)           // → [{ name: 'Male', value: 9 }, ...]
countBy(data, r => `ε${r.apoe}`)    // → [{ name: 'ε34', value: 6 }, ...]
```
The backtick string in the APOE call prepends the Greek letter ε before the number
so the label reads "ε34" instead of just "34".

### `ageBins`

```tsx
const ageBins = (data: DonorRecord[]) => {
  const labels = ['<65', '65–69', '70–74', '75–79', '80–84', '85–89', '90+']
  const edges  = [0, 65, 70, 75, 80, 85, 90, Infinity]
  return labels.map((label, i) => ({
    label,
    n: data.filter(r => r.age_at_death >= edges[i] && r.age_at_death < edges[i + 1]).length,
  })).filter(b => b.n > 0)
}
```

**What it does:** Groups donors into 5-year age bins and returns a count per bin.
Unlike `countBy`, ages are continuous numbers — so this function manually defines
the boundary edges.

**Step by step:**
1. `edges` has one more element than `labels`. Edge `i` is the lower bound and edge
   `i + 1` is the upper bound for label `i`. `Infinity` as the last edge means "90
   or older" captures everything.
2. `labels.map((label, i) => ...)` iterates the label list. For each bin it runs a
   `.filter` over the full dataset to count how many records fall in the range.
3. `.filter(b => b.n > 0)` drops empty bins so the bar chart doesn't show zero-count
   bars. If all donors are 70–89, only those bins appear.

---

## 5. Sub-components

Small components defined at module level (outside `ChartsPanel`) are local to this
file but can be thought of as private helper components. Defining them outside the
main component body is important — if they were defined inside, React would recreate
the component function on every render, causing unnecessary unmount/remount cycles.

### `Tip` — Custom tooltip

```tsx
const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className='cp-tip'>
      <div className='cp-tip-lbl'>{label ?? payload[0].name}</div>
      <div className='cp-tip-val'>{payload[0].value}</div>
    </div>
  )
}
```

Recharts calls this component with three automatic props whenever the user hovers:
- `active` — boolean, `true` when hovering
- `payload` — array of data objects for the hovered point; `payload[0].value` is the
  number, `payload[0].name` is the series key
- `label` — the category label on the X axis (present for bar charts, absent for pie)

The `label ?? payload[0].name` pattern uses the nullish coalescing operator: if
`label` is `null` or `undefined` (pie chart case), fall back to `payload[0].name`.

Returning `null` when `!active` means nothing is rendered when the mouse is not hovering.

### `Legend`

```tsx
const Legend = ({ items }: { items: { name: string; value: number }[] }) => (
  <div className='cp-legend'>
    {items.map((d, i) => (
      <span key={d.name} className='cp-legend-item'>
        <span className='cp-legend-dot' style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
        {d.name} <span className='cp-legend-n'>({d.value})</span>
      </span>
    ))}
  </div>
)
```

A manual legend below each donut chart. Recharts has a built-in `<Legend />` component
but it doesn't handle dark-theme styling well; a custom one gives full CSS control.

The `key={d.name}` on each `span` is React's list reconciliation hint — it needs to be
unique and stable so React can track which item changed across re-renders.

### `Card`

```tsx
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className='cp-card'>
    <div className='cp-card-title'>{title}</div>
    <div className='cp-card-body'>{children}</div>
  </div>
)
```

A thin wrapper that provides consistent chrome (border, padding, title label) around
any chart. `children: React.ReactNode` means it accepts anything renderable — JSX
elements, strings, arrays of elements, etc.

### `Placeholder`

```tsx
const Placeholder = ({ label }: { label: string }) => (
  <div className='cp-card cp-card--ph'>
    <div className='cp-ph-plus'>+</div>
    <div className='cp-ph-label'>{label}</div>
  </div>
)
```

A dashed-border card with a `+` icon signalling an unimplemented future chart. Uses
the same `cp-card` base class as real charts, plus a modifier class `cp-card--ph` for
the dashed border and placeholder-specific sizing.

---

## 6. The main component: ChartsPanel

```tsx
const ChartsPanel: React.FC<Props> = ({ data }) => {
```

`React.FC<Props>` is a TypeScript generic. It means: "this is a React function
component whose props conform to the `Props` type". The `Props` type is:
```tsx
type Props = { data: DonorRecord[] }
```

### Early return for empty data

```tsx
if (data.length === 0) {
  return <div className='cp-panel cp-empty'>No records — adjust filters to see charts.</div>
}
```

Always handle the empty state before doing any computation — avoids dividing by zero
or rendering empty charts, and gives the user a clear message.

### Data derivation

```tsx
const ages  = ageBins(data)
const study = countBy(data, r => r.study_source)
const sex   = countBy(data, r => r.sex)
const braak = countBy(data, r => String(r.braak_stage)).sort((a, b) => Number(a.name) - Number(b.name))
const thal  = countBy(data, r => String(r.thal_phase)).sort((a, b) => Number(a.name) - Number(b.name))
const apoe  = countBy(data, r => `ε${r.apoe}`)
const mapt  = countBy(data, r => r.mapt)
```

All data derivation happens synchronously at the top of the render function. Because
`countBy` sorts by frequency, Braak and Thal need an extra `.sort` call afterwards to
restore numeric order (0, 1, 2, … rather than most-common-first).

`String(r.braak_stage)` converts the numeric BraakStage (0–6) to a string because
`countBy` expects string keys. `Number(a.name)` converts it back to a number for the
sort comparison.

---

## 7. Recharts primitives used

### The compositional model

Every Recharts chart follows this pattern:

```tsx
<ChartContainer width={N} height={N} data={yourData}>
  <Axis ... />
  <Axis ... />
  <Tooltip ... />
  <DataSeries ... />
</ChartContainer>
```

The container handles the SVG viewport. Children register themselves with the container
and are drawn in order. You never manually compute pixel positions — Recharts handles
the coordinate math.

---

## 8. How BarChart works

### Vertical bars (Age at Death)

```tsx
<BarChart
  width={230} height={170}
  data={ages}
  barCategoryGap='35%'
  margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
>
  <XAxis dataKey='label' tick={TICK} axisLine={ALINE} tickLine={false} />
  <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
  <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
  <Bar dataKey='n' fill='#0068b1' radius={[3, 3, 0, 0]} />
</BarChart>
```

| Prop | Meaning |
|------|---------|
| `width` / `height` | Fixed pixel dimensions. Recharts does not auto-size without `ResponsiveContainer` |
| `data` | The array of objects. Each object is one bar's worth of data |
| `barCategoryGap='35%'` | Gap between bar groups as a percentage of the category width — controls how fat the bars look |
| `margin` | Inner padding around the chart area. `left: -12` pulls the Y-axis labels slightly left to reclaim space |
| `XAxis dataKey='label'` | Tells the X axis to read the `label` field from each data object for its tick labels |
| `YAxis allowDecimals={false}` | Prevents "0.5" tick labels on a count axis |
| `tickLine={false}` | Hides the small tick marks; keeps the axis clean |
| `axisLine={false}` | Hides the axis line itself |
| `cursor={{ fill: ... }}` | The translucent rectangle that appears behind the hovered bar |
| `Bar dataKey='n'` | Reads the `n` field from each data object for bar height |
| `radius={[3, 3, 0, 0]}` | Rounded top-left, top-right corners; flat bottom corners |

### Horizontal bars (Study Source)

```tsx
<BarChart ... data={study} layout='vertical'>
  <XAxis type='number' ... />
  <YAxis type='category' dataKey='name' width={90} />
  <Bar dataKey='value' radius={[0, 3, 3, 0]} />
</BarChart>
```

`layout='vertical'` flips the chart — bars grow left to right instead of bottom to
top. When you do this, `XAxis` becomes the value axis (needs `type='number'`) and
`YAxis` becomes the category axis (needs `type='category'` and `dataKey`). The radius
is flipped too: right corners are rounded, left corners are flat.

---

## 9. How PieChart / donut works

```tsx
<PieChart width={150} height={150}>
  <Pie
    data={d}
    cx={71} cy={71}
    innerRadius={42} outerRadius={64}
    dataKey='value'
    paddingAngle={3}
    strokeWidth={0}
  >
    {d.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
  </Pie>
  <Tooltip content={<Tip />} />
</PieChart>
```

| Prop | Meaning |
|------|---------|
| `cx` / `cy` | Centre of the pie in pixels within the SVG canvas |
| `innerRadius` | Hole radius — what makes it a donut instead of a filled pie. Set to 0 for a full pie |
| `outerRadius` | Outer edge radius |
| `dataKey='value'` | Which field in each data object holds the slice's size |
| `paddingAngle={3}` | Degrees of gap between adjacent slices — creates the separated look |
| `strokeWidth={0}` | Removes the white border Recharts draws between slices by default |

### `Cell` — per-slice colouring

Without `Cell`, all slices would use the same default colour. By mapping over the data
and rendering one `<Cell fill={colour} />` per slice, you assign individual colours.
The `i % PIE_COLORS.length` expression cycles through the palette and wraps around if
there are more slices than colours.

---

## 10. Custom Tooltip pattern

By default, Recharts renders a styled tooltip box. The `content` prop replaces it
entirely with your own component:

```tsx
<Tooltip content={<Tip />} />
```

Recharts injects `active`, `payload`, and `label` props into whatever component you
pass. Your component is responsible for deciding what to render and when (the
`if (!active) return null` guard).

This is the standard way to match tooltip styling to a dark theme — the default
tooltip has a white background that looks wrong on dark UIs.

---

## 11. The `donut` inline helper

```tsx
const donut = (d: {name:string;value:number}[]) => (
  <>
    <PieChart width={150} height={150}>...</PieChart>
    <Legend items={d} />
  </>
)
```

`donut` is a plain function (not a React component) that returns JSX. The difference
matters:
- A React **component** is called by React during reconciliation: `<Donut data={d} />`
- A plain **function** is called directly in render: `{donut(d)}`

Since it's called inside the parent component's render, it doesn't create a separate
component boundary — no extra re-render, no separate lifecycle. It's equivalent to
writing the JSX inline; it's just factored out to avoid repeating the PieChart block
seven times.

The `<>...</>` is a React Fragment — a way to return multiple sibling elements without
adding an extra wrapper `div` to the DOM.

---

## 12. Patterns worth remembering

### Frequency map idiom

```tsx
const m: Record<string, number> = {}
data.forEach(r => { m[v] = (m[v] || 0) + 1 })
```

This pattern (empty object as accumulator, `|| 0` for the first occurrence) appears
constantly in data work. An alternative is `reduce`:

```tsx
data.reduce((acc, r) => {
  acc[key(r)] = (acc[key(r)] || 0) + 1
  return acc
}, {} as Record<string, number>)
```

Both do the same thing; `forEach` with mutation is often clearer to read.

### Sorting after `countBy`

`countBy` always sorts by frequency (highest first). For ordinal data like Braak stage
(0, 1, 2, 3, 4, 5, 6), you want numeric order instead:

```tsx
.sort((a, b) => Number(a.name) - Number(b.name))
```

The comparator function returns a negative number if `a` should come first, positive
if `b` should, zero if equal. Subtracting `b` from `a` gives ascending order.

### `as const` on shared style objects

```tsx
const TICK = { fill: '#4a5a6a', fontSize: 10 } as const
```

Without `as const`, TypeScript infers `fill: string` and `fontSize: number` — broad
types. With `as const` it infers `fill: '#4a5a6a'` and `fontSize: 10` — exact literal
types. This is stricter and catches typos if you accidentally reassign a field.

### Empty-state guard before computation

```tsx
if (data.length === 0) {
  return <div>No records</div>
}
// ... all the countBy calls below are safe
```

Guard clauses at the top of a component make the happy path (non-empty data) easier to
read and prevent bugs from passing empty arrays into functions that assume at least one
element exists.

---

## 13. How to add a new chart

Say you want to add a "Cognitive Status" bar chart.

**Step 1 — derive the data** (add one line near the top of `ChartsPanel`):
```tsx
const cognitive = countBy(data, r => r.cognitive_status)
```

**Step 2 — render it** (add one `<Card>` in the scroll row):
```tsx
<Card title='Cognitive Status'>
  <BarChart width={200} height={170} data={cognitive} barCategoryGap='35%'
            margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
    <XAxis dataKey='name' tick={TICK} axisLine={ALINE} tickLine={false} />
    <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
    <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
    <Bar dataKey='value' fill='#0068b1' radius={[3, 3, 0, 0]} />
  </BarChart>
</Card>
```

**Step 3 — remove the placeholder** (delete or comment out):
```tsx
// <Placeholder label='Cognitive Status' />
```

That's all. The modal scrolls horizontally so adding more cards never breaks the layout.

For a donut chart instead of a bar:
```tsx
<Card title='Cognitive Status'>{donut(cognitive)}</Card>
```
