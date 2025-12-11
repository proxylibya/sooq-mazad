// API Response Helpers
export const ApiResponse = {
  success: (data, message = 'تم بنجاح') => ({
    success: true,
    message,
    data
  }),
  
  error: (message = 'حدث خطأ', statusCode = 500) => ({
    success: false,
    error: message,
    statusCode
  }),
  
  notFound: (resource = 'المورد') => ({
    success: false,
    error: `${resource} غير موجود`,
    statusCode: 404
  }),
  
  unauthorized: (message = 'غير مصرح') => ({
    success: false,
    error: message,
    statusCode: 401
  }),
  
  badRequest: (message = 'طلب غير صحيح') => ({
    success: false,
    error: message,
    statusCode: 400
  })
};

export const handleApiError = (error, res) => {
  console.error('API Error:', error);
  
  if (error.code === 'P2002') {
    return res.status(400).json(ApiResponse.badRequest('البيانات مكررة'));
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json(ApiResponse.notFound());
  }
  
  return res.status(500).json(ApiResponse.error(error.message));
};