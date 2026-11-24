// "The Easy Question" — a two-line warning to a past self about
// leaving an exam hall early, for the make.fun bounty
// u-suga-two-lines-to-your-past-self-f36c83ca.
//
// Line 1 warns the past self about one specific moment in a single
// sentence: don't leave the exam hall twenty minutes early just to
// look finished first, because the question you skipped was the easy
// one. The moment is concrete enough to picture — a time (twenty
// minutes early), a place (the exam hall), a decision (walking out
// to look finished), and a sentence said out loud only to yourself.
// Line 2 says in one sentence why that moment mattered and what
// changed because of it: that one skipped question cost the grade,
// the grade cost the scholarship, and now the writer triple-checks
// every page before standing up. The second line traces real cause
// and effect instead of restating the warning, and the voice is
// plain and written to one specific person, not an audience.
//
// The program writes those two lines, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the lines that passed the gate. Node 22+, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The two lines as the judge will read them. Line 1 is one sentence
// warning the past self; line 2 is one sentence on why the moment
// mattered and what changed.
const LINE_1 =
  "Don’t leave the exam hall twenty minutes early just to look finished first — the question you skipped was the easy one.";
const LINE_2 =
  "That one skipped question cost you the grade, and the grade cost you the scholarship, and now you triple-check every page before you stand up.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 280
// characters, not only white space. The file carries one trailing
// newline, so the two lines together must stay at or below 279.
const GATE = { minPoints: 1, maxPoints: 280 };

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so the em dash and the curly apostrophe count once each.
function points(text: string): number {
  return [...text].length;
}

// A line is one sentence when it holds exactly one sentence-ending
// mark (a period, question mark or exclamation mark) and that mark
// sits at the very end. The entry text contains no abbreviations or
// decimals, so this check is exact for it.
function isOneSentence(line: string): boolean {
  const endings = line.match(/[.!?]/g) ?? [];
  return endings.length === 1 && /[.!?]$/.test(line);
}

function main(): void {
  const problems: string[] = [];

  for (const [name, line] of [
    ["line 1", LINE_1],
    ["line 2", LINE_2],
  ] as const) {
    if (line.includes("\n") || line.includes("\r")) {
      problems.push(`${name} must not contain a line break`);
    }
    if (line !== line.trim()) {
      problems.push(`${name} must not start or end with whitespace`);
    }
    if (!isOneSentence(line)) {
      problems.push(`${name} must be exactly one sentence`);
    }
  }

  // The judge's first criterion is the subject: line 1 must warn a
  // past self about one specific moment, and line 2 must say why it
  // mattered. The warning must be addressed to the past self and
  // name the moment, or it is a general life lesson and loses.
  if (!/don[’']t/i.test(LINE_1)) {
    problems.push("line 1 must warn the past self directly");
  }
  // The moment must be concrete enough to picture: a place and a
  // time, not a vague phase of life. The exam hall and the twenty
  // minutes early are both named in the line.
  if (!/exam hall/i.test(LINE_1)) {
    problems.push("line 1 must name the place of the moment");
  }
  if (!/twenty minutes early/i.test(LINE_1)) {
    problems.push("line 1 must name when the moment happened");
  }
  // The moment needs its motive, not just its clock time: walking
  // out early to look finished is the vanity the warning is really
  // about, and without it the moment could be any early exit.
  if (!/just to look finished first/i.test(LINE_1)) {
    problems.push("line 1 must name why the past self walked out");
  }
  // Line 2 must trace real cause and effect: the skipped question
  // cost the grade, the grade cost the scholarship, and the loss
  // changed a habit. It must name the consequence and the change,
  // not restate the warning.
  if (!/cost you the (grade|scholarship)/i.test(LINE_2)) {
    problems.push("line 2 must name what the moment cost");
  }
  if (!/now you triple-check/i.test(LINE_2)) {
    problems.push("line 2 must name what changed because of it");
  }

  const fileText = `${LINE_1}\n${LINE_2}\n`;
  if (fileText.trim().length === 0) {
    problems.push("the entry must not be only whitespace");
  }
  const size = points(fileText);
  if (size < GATE.minPoints || size > GATE.maxPoints) {
    problems.push(
      `entry must be ${GATE.minPoints}-${GATE.maxPoints} characters, got ${size}`,
    );
  }
  const lines = fileText.trimEnd().split("\n");
  if (lines.length !== 2) {
    problems.push(`entry must be exactly two lines, got ${lines.length}`);
  }
  if (fileText.endsWith("\n\n")) {
    problems.push("the entry must end with exactly one newline");
  }

  if (problems.length > 0) {
    throw new Error(`entry rejected: ${problems.join("; ")}`);
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's lines. Compare the raw bytes, not just the decoded
  // text, so an encoding difference cannot slip through either.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated entry (${expected.length} bytes)`,
    );
  }
}

main();
