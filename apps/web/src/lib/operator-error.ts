export function operatorError(status: number): string {
  const messages: Record<number, string> = {
    400: 'Revisa los datos de la búsqueda.',
    401: 'Acceso no autorizado. Utiliza el usuario «operador» y la contraseña de la consola.',
    404: 'Trabajo no encontrado.',
    409: 'La clave ya corresponde a otra búsqueda. Revisa los datos antes de volver a enviar.',
    429: 'Demasiadas solicitudes. Espera un momento antes de reintentar.',
  };
  return messages[status] ?? 'No se pudo contactar con el servicio de búsquedas. Vuelve a intentarlo.';
}
