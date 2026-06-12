import ChatWidget from "@/components/chat/ChatWidget";
import PatientMessagePanel from "@/components/messaging/PatientMessagePanel";
import { PatientSessionRuntimeProvider } from "@/features/patient-sessions/PatientSessionRuntimeProvider";

export default function DeferredPatientMessaging() {
  return (
    <PatientSessionRuntimeProvider>
      <ChatWidget />
      <PatientMessagePanel />
    </PatientSessionRuntimeProvider>
  );
}
