import { useEffect, useMemo, useRef, useState } from 'react';
import { CreditCard, Package2, ReceiptText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreatePatientPaymentIntent, usePatientOrder, usePatientOrders, usePatientPackage } from '@/hooks/usePatientPhase2';
import {
  formatDateOnly,
  formatDateTime,
  formatMoney,
  orderStatusLabel,
  orderStatusTone,
  orderTypeLabel,
  paymentMethodLabel,
} from '@/lib/patient-phase2';
import type { PatientPackage } from '@/types/patient-phase2';
import { crmApi } from '@/services/api/crmApiClient';

function localizedPackageName(pkg: PatientPackage, languageCode: string) {
  const localizedName = (pkg as PatientPackage & { name?: string | null }).name;
  return localizedName || (languageCode.startsWith('zh') && pkg.nameZh ? pkg.nameZh : pkg.nameEn);
}

function localizedPackageDescription(pkg: PatientPackage, languageCode: string) {
  const localizedDescription = (pkg as PatientPackage & { description?: string | null }).description;
  return localizedDescription || (languageCode.startsWith('zh') ? pkg.descriptionZh : pkg.descriptionEn);
}

export default function OrdersPage() {
  const { currentLanguage, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOrderId = searchParams.get('orderId');
  const [page, setPage] = useState(1);
  const ordersQuery = usePatientOrders({ page, limit: 20 });
  const orderDetailQuery = usePatientOrder(selectedOrderId);
  const paymentIntentMutation = useCreatePatientPaymentIntent();
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'confirming' | 'confirmed' | 'cancelled' | 'failed'>('idle');
  const checkoutConfirmationRef = useRef<string | null>(null);

  const orders = ordersQuery.data?.data ?? [];
  const selectedOrder = useMemo(
    () => orderDetailQuery.data ?? orders.find((order) => order.id === selectedOrderId) ?? null,
    [orderDetailQuery.data, orders, selectedOrderId],
  );
  const packageDetailQuery = usePatientPackage(selectedOrder?.packageId ?? null);
  const totalPages = Math.max(1, Math.ceil((ordersQuery.data?.total ?? 0) / (ordersQuery.data?.limit ?? 20)));

  useEffect(() => {
    if (!selectedOrderId && orders[0]?.id) {
      const next = new URLSearchParams(searchParams);
      next.set('orderId', orders[0].id);
      setSearchParams(next, { replace: true });
    }
  }, [orders, searchParams, selectedOrderId, setSearchParams]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'cancelled') {
      const next = new URLSearchParams(searchParams);
      next.delete('checkout');
      setSearchParams(next, { replace: true });
      setCheckoutStatus('cancelled');
      return;
    }

    const checkoutSessionId = searchParams.get('session_id');
    if (
      searchParams.get('checkout') !== 'success'
      || !checkoutSessionId
      || checkoutConfirmationRef.current === checkoutSessionId
    ) {
      return;
    }

    checkoutConfirmationRef.current = checkoutSessionId;
    setCheckoutStatus('confirming');

    void crmApi.confirmOrderCheckout(checkoutSessionId)
      .then(async ({ orderId }) => {
        await ordersQuery.refetch();
        const next = new URLSearchParams(searchParams);
        next.set('tab', 'orders');
        next.set('orderId', orderId);
        next.delete('checkout');
        next.delete('session_id');
        setSearchParams(next, { replace: true });
        setCheckoutStatus('confirmed');
      })
      .catch(() => {
        setCheckoutStatus('failed');
      });
  }, [ordersQuery.refetch, searchParams, setSearchParams]);

  const handleSelectOrder = (orderId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('orderId', orderId);
    setSearchParams(next, { replace: true });
  };

  const handlePreparePayment = async () => {
    if (!selectedOrder) {
      return;
    }

    const result = await paymentIntentMutation.mutateAsync(selectedOrder.id);
    window.location.assign(result.checkoutUrl);
  };

  return (
    <div className="flex min-h-[calc(100vh-2.5rem)] flex-col gap-4">
      <div>
        <div className="text-2xl font-semibold text-slate-900">{t('dashboard.orders.title')}</div>
        <div className="text-sm text-slate-500">
          {t('dashboard.orders.subtitle')}
        </div>
      </div>

      {checkoutStatus !== 'idle' ? (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          checkoutStatus === 'failed'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : 'border-teal-200 bg-teal-50 text-teal-800'
        }`}>
          {checkoutStatus === 'confirming'
            ? 'Confirming your Stripe payment...'
            : checkoutStatus === 'confirmed'
              ? 'Payment confirmed. Your Written Review order is now available below.'
              : checkoutStatus === 'cancelled'
                ? 'Payment was not completed. Your order has been saved, and you can continue payment below.'
                : 'We could not confirm the payment yet. Please refresh the Orders page in a moment.'}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10 lg:grid-cols-[340px_1fr]">
        <div className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/70">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t('dashboard.orders.mine')}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {t('dashboard.orders.totalSummary', {
                    count: ordersQuery.data?.total ?? 0,
                    orderLabel: t((ordersQuery.data?.total ?? 0) === 1 ? 'dashboard.orders.orderSingular' : 'dashboard.orders.orderPlural'),
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  {t('dashboard.common.prev')}
                </Button>
                <span className="text-xs text-slate-500">{t('dashboard.common.pageCount', { page, totalPages })}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                  {t('dashboard.common.next')}
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-3 p-4">
              {ordersQuery.isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                  {t('dashboard.orders.loading')}
                </div>
              ) : ordersQuery.error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                  {ordersQuery.error instanceof Error ? ordersQuery.error.message : t('dashboard.orders.loadFailed')}
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
                  {t('dashboard.orders.empty')}
                </div>
              ) : (
                orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className={`flex w-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
                      order.id === selectedOrder?.id
                        ? 'border-teal-300 bg-white shadow-sm'
                        : 'border-transparent bg-white/70 hover:border-slate-200 hover:bg-white'
                    }`}
                    onClick={() => handleSelectOrder(order.id)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{order.orderNumber}</div>
                        <div className="mt-1 text-xs text-slate-500">{formatMoney(order.amount, order.currency, currentLanguage.code)}</div>
                      </div>
                      <Badge variant="secondary" className={orderStatusTone(order.status)}>
                        {orderStatusLabel(order.status, t)}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      {t('dashboard.orders.created', { date: formatDateTime(order.createdAt, currentLanguage.code, t) })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="min-w-0 bg-white">
          {!selectedOrder ? (
            <div className="flex h-full items-center justify-center bg-slate-50">
              <div className="max-w-sm rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
                {t('dashboard.orders.choose')}
              </div>
            </div>
          ) : orderDetailQuery.isLoading ? (
            <div className="p-6 text-sm text-slate-500">{t('dashboard.orders.detailLoading')}</div>
          ) : orderDetailQuery.error ? (
            <div className="p-6 text-sm text-rose-700">
              {orderDetailQuery.error instanceof Error ? orderDetailQuery.error.message : t('dashboard.orders.detailFailed')}
            </div>
          ) : (
            <div className="space-y-4 p-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
                    <ReceiptText className="h-5 w-5 text-teal-600" />
                    {selectedOrder.orderNumber}
                    <Badge variant="secondary" className={orderStatusTone(selectedOrder.status)}>
                      {orderStatusLabel(selectedOrder.status, t)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard.orders.createdUpdated', {
                      created: formatDateTime(selectedOrder.createdAt, currentLanguage.code, t),
                      updated: formatDateTime(selectedOrder.updatedAt, currentLanguage.code, t),
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 px-0 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('dashboard.orders.packageValue')}</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-900">
                      {formatMoney(selectedOrder.amount, selectedOrder.currency, currentLanguage.code)}
                    </div>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      <div>{t('dashboard.orders.type', { type: orderTypeLabel(selectedOrder.type, t) })}</div>
                      <div>{t('dashboard.orders.caseLink', { caseId: selectedOrder.caseId || t('dashboard.orders.notLinked') })}</div>
                      <div>{t('dashboard.orders.paymentMethod', { method: selectedOrder.paymentMethod ? paymentMethodLabel(selectedOrder.paymentMethod, t) : t('dashboard.orders.paymentNotChosen') })}</div>
                      <div>{t('dashboard.orders.paidAt', { date: formatDateOnly(selectedOrder.paidAt, currentLanguage.code, t) })}</div>
                      <div>{t('dashboard.orders.completedAt', { date: formatDateOnly(selectedOrder.completedAt, currentLanguage.code, t) })}</div>
                    </div>
                    {selectedOrder.status === 'PENDING_PAYMENT' ? (
                      <div className="mt-5 space-y-3">
                        <Button
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => void handlePreparePayment()}
                          disabled={paymentIntentMutation.isPending}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {paymentIntentMutation.isPending ? t('dashboard.orders.preparing') : t('dashboard.orders.preparePayment')}
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Package2 className="h-4 w-4 text-teal-600" />
                      {t('dashboard.orders.packageSource')}
                    </div>
                    {selectedOrder.packageId ? (
                      packageDetailQuery.isLoading ? (
                        <div className="mt-4 text-sm text-slate-500">{t('dashboard.orders.packageLoading')}</div>
                      ) : packageDetailQuery.error ? (
                        <div className="mt-4 text-sm text-rose-700">
                          {packageDetailQuery.error instanceof Error ? packageDetailQuery.error.message : t('dashboard.orders.packageFailed')}
                        </div>
                      ) : packageDetailQuery.data ? (
                        <div className="mt-4 space-y-3">
                          <div className="text-lg font-semibold text-slate-900">
                            {localizedPackageName(packageDetailQuery.data, currentLanguage.code)}
                          </div>
                          <div className="text-sm leading-6 text-slate-600">
                            {localizedPackageDescription(packageDetailQuery.data, currentLanguage.code) || t('dashboard.orders.noPackageDescription')}
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            {formatMoney(packageDetailQuery.data.price, packageDetailQuery.data.currency, currentLanguage.code)}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 text-sm text-slate-500">{t('dashboard.orders.packageUnavailable')}</div>
                      )
                    ) : selectedOrder.metadata && typeof selectedOrder.metadata === 'object'
                      && typeof (selectedOrder.metadata as Record<string, unknown>).serviceName === 'string' ? (
                        <div className="mt-4 space-y-2">
                          <div className="text-lg font-semibold text-slate-900">
                            {(selectedOrder.metadata as Record<string, unknown>).serviceName as string}
                          </div>
                          <div className="text-sm leading-6 text-slate-600">
                            Specialist review of your submitted medical records and a written second-opinion report.
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 text-sm text-slate-500">{t('dashboard.orders.noPackageRecord')}</div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
