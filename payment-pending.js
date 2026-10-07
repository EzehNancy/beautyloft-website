const savedOrder =
  JSON.parse(
    localStorage.getItem(
      'pendingBeautyLoftOrder'
    ) || 'null'
  );


if (
  savedOrder &&
  savedOrder.order &&
  savedOrder.order.order_ref
) {

  document.getElementById(
    'pendingOrderReference'
  ).textContent =
    savedOrder.order.order_ref;

}