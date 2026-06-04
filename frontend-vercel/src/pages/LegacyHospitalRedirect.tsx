import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { hospitalApi } from "@/services/api/hospital";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function LegacyHospitalRedirect() {
  const { id } = useParams<{ id: string }>();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setTarget("/hospitals");
      return;
    }

    if (!UUID_REGEX.test(id)) {
      setTarget(`/hospitals/${id}`);
      return;
    }

    let isMounted = true;
    hospitalApi
      .getHospitalExtendedBySlug(id, "zh")
      .then((response) => {
        if (!isMounted) return;
        setTarget(`/hospitals/${response.data.slug || id}`);
      })
      .catch(() => {
        if (!isMounted) return;
        setTarget(`/hospitals/${id}`);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!target) {
    return null;
  }

  return <Navigate to={target} replace />;
}
