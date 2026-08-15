"use client";

import dynamic from "next/dynamic";
import Loading from "../loading";

const KiblatFinder = dynamic(() => import("../components/KiblatFinder"), {
  ssr: false,
  loading: () => <Loading />,
});

export default function KiblatPage() {
  return <KiblatFinder />;
}
