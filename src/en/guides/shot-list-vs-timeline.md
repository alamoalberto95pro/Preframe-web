---
guide: shot-list-vs-timeline
title: "Why a shot list fails when you edit to music (and what to use instead)"
description: "A shot list tells you what to film. It doesn't tell you where each shot goes in the song, how long it stays, or whether the whole track is covered. Three extra columns fix it — free template included."
date: 2026-09-17
minutes: 6
order: 5
image: /assets/guides/shot-list-vs-timeline/og.png
ogImageAlt: "A page of a shooting plan: sections with timecodes, shot cards with tick boxes and highlighted rows of uncovered time."
---
If you've ever filmed without a plan, you know how it ends. You get home with a pile of clips and you can't tell what you actually shot and what you didn't. The only way to find out is to watch all of them again, one by one, looking for the ones that fit the video in your head.

The usual fix is a shot list. And a shot list helps — right up to the moment you put a song under it.

## What a shot list is good at

A shot list is a table. One row per shot: number, description, size (wide, medium, close), movement, lens, location, notes. It comes from scripted film, where a scene has a fixed set of setups and the job is to not forget any.

It answers one question very well: **what do I need to film?**

## The three questions it can't answer

When the piece is edited to music, three other questions matter more, and a list has nowhere to put them.

**Where in the song does this shot go?** "Wide of the harbour" is a fine row. Is it the quiet opening or the chorus? That changes everything about how you shoot it — static and long, or moving and brief.

**How long does it stay on screen?** A list treats a 10-second held shot and a 1-second flash as the same thing: one row each. But the first needs a take that *holds* for 10 seconds, and the second needs twelve siblings.

**Is the whole song covered?** This is the one that hurts. A list of 40 shots feels complete. It can still leave twenty seconds of the track with nothing on them, and a list will never show you, because a list has no length.

The problem isn't the content of the list. It's the shape. A song is a line with a beginning and an end, and you are planning it in a format with neither.

## The fix: give the list a clock

You don't need to throw the list away. You need three more columns:

| Column | What goes in it |
|---|---|
| **Section** | Which part of the song the shot belongs to |
| **On screen (s)** | How many seconds it stays in the edit |
| **Starts at → Ends at** | Where it falls in the track |

With those, the rows stop being a checklist and become a timeline written as a table. Sort by *Starts at* and you are reading your film from top to bottom.

<div class="callout">

**Free template.** A spreadsheet with those columns already set up, two example rows and the rules for filling it in: [download the shot list template (CSV)](/assets/guides/shot-list-vs-timeline/shot-list-template.csv). It opens in Google Sheets, Numbers and Excel.

</div>

## How to fill it in

1. **Start from the sections, not the shots.** List each section of the song with its start and end. If you haven't cut the song yet, [this is how]({{ langBase }}/guides/cut-a-song-into-sections/).
2. **Budget each section.** Length of the section divided by how long a shot stays on screen there. A calm 20 seconds at 5 seconds a shot is 4 rows. A 20-second chorus at 2 seconds a shot is 10.
3. **Write the rows.** Each shot *starts* where the previous one *ends*.
4. **Do the check.** The last *Ends at* in a section has to reach the end of that section. If it stops short, the gap is **uncovered time** — seconds of music with no picture. Add a shot or stretch one.
5. **On location, tick as you go.** At the end of the day, anything unticked is a hole in your edit, and you know exactly where in the song it is.

Step 4 is the one a plain list can never give you. It is also the one that means you don't have to rewatch everything when you get home: you already know what you have, because every clip was shot for a slot.

## The same thing in PreFrame

A spreadsheet works, and it has one real limit: you're typing numbers about a song you can't see or hear while you type.

PreFrame is that table drawn on the song itself. The track's waveform is the timeline; sections are cut on it; each shot is a card with its type, camera, lens, duration and notes, sitting on real seconds inside its section.

<figure>
<img src="/assets/guides/shot-list-vs-timeline/timeline.png" alt="The PreFrame timeline: a waveform cut into six named sections with an emotional curve drawn over it." width="1600" height="412" loading="lazy">
<figcaption>The clock the list was missing: the song itself.</figcaption>
</figure>

<figure>
<img src="/assets/guides/shot-list-vs-timeline/shot-cards.png" alt="Two shot cards inside a section: 'Window in the dark', a 10-second detail, and 'Sleeping skyline', a 9.5-second extreme wide, with their camera and lens." width="1600" height="442" loading="lazy">
<figcaption>Still a shot list — name, type, gear, duration — but every card knows where it lives.</figcaption>
</figure>

The check in step 4 isn't something you do; it's something you see. When you export the shooting plan, uncovered time is calculated and printed between the shots, with its timecodes, next to a box to tick for every shot and blank lines to write on.

<figure>
<img src="/assets/shots/pdf-shots.webp" alt="A page of the shooting plan PDF: sections with timecodes, shot cards with tick boxes and note lines, and highlighted 'Uncovered time' rows such as 0:08 to 0:16." width="1194" height="1333" loading="lazy">
<figcaption>The printed plan. The orange rows are the seconds nobody has planned yet.</figcaption>
</figure>

Nobody discovers the hole at six in the evening with the light gone. And nobody has to watch forty clips to remember what they filmed.
