const funiOptions = {
  quality: 10,
  server: 1,
  suffix: "SIZEp",
  releaser: "Funimation",
  novids: true,
  mp4: true,
  mks: true,
  enSub: true
};
const crOptions = {
  user: process.env.crEmail,
  pass: process.env.crPass,
  quality: "max",
  server: 1,
  suffix: "SIZEp",
  grouptag: "CR",
  debug: true,
  mp4: true,
  dlsubs: "enUS",
  hslang: "enUS",
  ssu: true,
  skipmux: true,
  skipdl: true,  // modified it to not actually dl ok
  skipsubs: false,
  pagemsgs: true,
  filename: "[{rel_group}] {title} - {ep_num} [{suffix}]"
}
const vrvOptions = {
   email: process.env.vrvEmail,
   password: process.env.vrvPass,
   lang: "enUS",
  debug: false
 }
export {funiOptions, crOptions, vrvOptions};