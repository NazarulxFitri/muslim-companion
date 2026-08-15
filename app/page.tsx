"use client";

import dynamic from "next/dynamic";
import Loading from "./loading";

const PrayerTimes = dynamic(() => import("./components/PrayerTimes"), {
  ssr: false,
  loading: () => <Loading />,
});

export default function Home() {
  return <PrayerTimes />;
}
