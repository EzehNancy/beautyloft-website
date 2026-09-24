
  const savedOrder =
    JSON.parse(
      localStorage.getItem(
        'pendingBeautyLoftOrder'
      ) || 'null'
    );


  if (
    savedOrder &&
    savedOrder.order &&
    savedOrder.order.reference
  ) {

    document.getElementById(
      'pendingOrderReference'
    ).textContent =
      savedOrder.order.reference;

  }