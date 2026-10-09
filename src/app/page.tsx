import Nav from "@/components/Nav";
import Density from "@/components/Density";
import Hero from "@/components/Hero";
import SystemFlow from "@/components/SystemFlow";
import Work from "@/components/Work";
import Capabilities from "@/components/Capabilities";
import Engagement from "@/components/Engagement";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import Cta from "@/components/Cta";
import SiteFooter from "@/components/SiteFooter";

export default function Page() {
  return (
    <>
      <Density />
      <Nav />
      <main>
        <Hero />
        {/*
          Everything after the hero sits in one opaque, raised plane. The hero
          ends on its own landing scene (the statement, the cards, the client
          strip), which unpins and scrolls away as ordinary page, so this plane
          simply follows it — nothing rises over anything.
        */}
        <div className="relative z-40 bg-canvas">
          <SystemFlow />
          <Work />
          <Capabilities />
          <Engagement />
          <Testimonials />
          <Faq />
          <Cta />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
