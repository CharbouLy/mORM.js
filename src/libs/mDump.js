import moment from "moment";
import kleur from "kleur";

export default function mDump(str, c = "yellow", withNewLine = true) {
  const display = kleur[c](`${moment().format()} :: ${str}`);
  if (withNewLine) {
    console.log(display);
  } else {
    process.stdout.write(display);
  }
}
