import { useEffect, useState } from 'react';
import { AvailabilityBookingSection } from './components/AvailabilityBookingSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { HostingGuideModal } from './components/HostingGuideModal';
import { Navbar } from './components/Navbar';
import { OlympicHeritageSection } from './components/OlympicHeritageSection';
import { SpacesShowcase } from './components/SpacesShowcase';
import { DEFAULT_BOOKING_EMAIL } from './utils/ical';

const STORAGE_KEY = 'kite_house_recipient_email';

export default function App() {
  const [recipientEmail, setRecipientEmail] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_BOOKING_EMAIL;
    } catch {
      return DEFAULT_BOOKING_EMAIL;
    }
  });
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, recipientEmail);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [recipientEmail]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main>
        <HeroSection />
        <SpacesShowcase />
        <OlympicHeritageSection />
        <AvailabilityBookingSection recipientEmail={recipientEmail} />
      </main>
      <Footer
        recipientEmail={recipientEmail}
        onOpenHostingGuide={() => setGuideOpen(true)}
      />
      <HostingGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        recipientEmail={recipientEmail}
        onUpdateRecipientEmail={setRecipientEmail}
      />
    </div>
  );
}
