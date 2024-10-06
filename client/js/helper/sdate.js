export default {
  sameday(t1, t2) {
    t1 = new Date(t1);
    t2 = new Date(t2);
    return t1.getFullYear() === t2.getFullYear() && t1.getMonth() === t2.getMonth() && t1.getDate() === t2.getDate();
  },
  time(ts) {
    return new Date(ts).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
  },
  date(ts) {
    return new Date(ts).toLocaleDateString(navigator.language, { year: '2-digit', month: '2-digit', day: '2-digit' })
  }
}