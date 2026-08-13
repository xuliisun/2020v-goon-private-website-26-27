# Photos go in this folder

Drop a file in here with the exact name below and it appears on the site.
**No HTML editing needed** - the page already points at these filenames.

If a file isn't here yet, the site quietly shows the fallback instead (the
member's initials, or the robot icon). Nothing looks broken while you wait.

## Team photos - `#team`

| File name | Whose photo |
|---|---|
| `aaron-sui.jpg` | Aaron Sui |
| `alexander-wang.jpg` | Alexander Wang |
| `anson-xiao.jpg` | Anson Xiao |
| `ann-xue.jpg` | Ann Xue |
| `charlie-shao.jpg` | Charlie Shao |
| `helios-zhang.jpg` | Helios Zhang |
| `justin-cao.jpg` | Justin Cao |
| `owen-xie.jpg` | Owen Xie |
| `ryan-ni.jpg` | Ryan Ni |
| `xuliang-sun.jpg` | Xuliang Sun |
| `zachary-liu.jpg` | Zachary Liu |

**Shape:** square. The card crops to a square, so a non-square photo gets
cut off at the sides or top/bottom. Crop before dropping it in.
**Size:** about 600×600 pixels is plenty.

## Robot photos - `#bot`

| File name | Where it shows |
|---|---|
| `robot-main.jpg` | the big photo |
| `robot-1.jpg` | small photo, top-left |
| `robot-2.jpg` | small photo, top-right |
| `robot-3.jpg` | small photo, bottom-left |
| `robot-4.jpg` | small photo, bottom-right |

**Shape:** `robot-main.jpg` is 4:3 (landscape). The four small ones are
square. **Size:** 1200×900 for the main one, 800×800 for the small ones.

## Rules that matter

1. **Names are case-sensitive.** `Aaron-Sui.JPG` will not work.
   All lowercase, exactly as written above.
2. **Keep the `.jpg` ending**, even if your file is really a PNG - or rename
   the entry in `index.html` to match your file. Mismatched names are the most
   common reason a photo doesn't appear.
3. **Keep files under ~500 KB each.** Phone photos are often 3–5 MB, which
   makes the page slow to load. Any free "compress JPEG" site will fix this.
4. **Photos must live in this folder.** The site's security policy only
   allows images from its own files - a link to Google Drive, Imgur, or
   Google Photos will be blocked and show nothing. Download the photo and
   put the file here instead.

## Adding someone new, or a sixth robot photo

Copy an existing block in `index.html` and change the name and `src`. The
team blocks start around the `<!-- VIEW: MEET THE TEAM -->` comment.
