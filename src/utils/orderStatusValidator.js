

/**
 * Valida si una orden puede cambiar de estado
 * según las reglas de negocio
 */
export function canTransitionOrder(currentStatus, nextStatus) {
  const allowedTransitions = {
    PENDING: ["PAID", "CANCELLED"],
    PAID: [],
    CANCELLED: [],
  };

  return allowedTransitions[currentStatus]?.includes(nextStatus);
}

