import { ArrowRight, LockKeyhole, Package2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { useCreatePatientOrder, usePatientPackages } from '@/hooks/usePatientPhase2';
import { useLanguage } from '@/contexts/LanguageContext';
import { createOrderIdempotencyKey, formatLocalizedPackageMoney, renderStructuredValue } from '@/lib/patient-phase2';

export default function PatientPackagesCatalog() {
  const navigate = useNavigate();
  const { isAuthenticated } = usePatientAuth();
  const { openWidget } = usePatientEntry();
  const { currentLanguage } = useLanguage();
  const packagesQuery = usePatientPackages({ page: 1, limit: 50, enabled: isAuthenticated });
  const createOrderMutation = useCreatePatientOrder();

  const handleCreateOrder = async (packageId: string) => {
    const order = await createOrderMutation.mutateAsync({
      packageId,
      idempotencyKey: createOrderIdempotencyKey(packageId),
    });

    navigate(`/dashboard?tab=orders&orderId=${order.id}`);
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-medium text-teal-800">
              <Package2 className="h-4 w-4" />
              Patient ordering
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Published packages synced from CRM v2
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Patients can place orders directly from this page. The same package can also be referenced later inside formal message threads.
            </p>
          </div>

          {!isAuthenticated ? (
            <Card className="w-full max-w-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LockKeyhole className="h-4 w-4 text-teal-600" />
                  Patient session required
                </CardTitle>
                <CardDescription>
                  Ordering stays inside the CRM v2 patient session.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={openWidget}>
                  Open Widget
                </Button>
                <Button variant="outline" onClick={() => navigate('/patient-login')}>
                  Patient Login
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {!isAuthenticated ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500 shadow-lg">
            Open the widget or sign in to unlock CRM-published packages and place a patient order.
          </div>
        ) : packagesQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 shadow-lg">
            Loading patient packages...
          </div>
        ) : packagesQuery.error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-sm text-rose-700 shadow-lg">
            {packagesQuery.error instanceof Error ? packagesQuery.error.message : 'Failed to load packages.'}
          </div>
        ) : (packagesQuery.data?.data ?? []).length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500 shadow-lg">
            No published packages are available yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {(packagesQuery.data?.data ?? []).map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden border-0 shadow-xl shadow-slate-950/5">
                <div className="grid h-full md:grid-cols-[220px_1fr]">
                  <div className="h-full bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 p-6 text-white">
                    <div className="text-xs uppercase tracking-[0.2em] text-teal-100">{pkg.type}</div>
                    <div className="mt-4 text-3xl font-semibold">{formatLocalizedPackageMoney(pkg.price, pkg.currency, currentLanguage.code)}</div>
                    <div className="mt-4 text-sm leading-6 text-teal-50">
                      CRM-published package
                    </div>
                  </div>

                  <div className="flex h-full flex-col px-6 py-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900">{pkg.nameEn}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {pkg.descriptionEn || 'Package details are available after the care team publishes the offering.'}
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                      {renderStructuredValue(pkg.inclusions)}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={!isAuthenticated || createOrderMutation.isPending}
                        onClick={() => void handleCreateOrder(pkg.id)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {createOrderMutation.isPending ? 'Creating order...' : 'Order This Package'}
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/dashboard?tab=orders')}>
                        View Orders
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
