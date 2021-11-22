import "../src/index.css";
import "../src/App.css";
import "../src/Diary.css";
import "../src/Flare.css";
import "../src/FlareViewer.css";
import "../src/gfm.css";

export default function MyApp({ Component, pageProps }) {
  if (typeof window == "undefined") return null;
  return <Component {...pageProps} />;
}
