import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 인증 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // TODO: 임시 토큰 - 실제 로그인 구현 후 삭제 필요!!!
    const TEMP_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5IiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImp0aSI6IjczMTJlNDVkLWRjOTQtNDI3Zi04YWI3LWRlZmQxYjY4OTQ1NyIsImlhdCI6MTc2MTk3NzM0NywiZXhwIjoxNzYyMDYzNzQ3fQ.8oE3L0zeT-FljvvAr75QCvR9KZA6_PwijBjlzuIEoFcLzFt5RkkGTiyDboePbGtE5jf_u2lUqRs2Uo7xwZkpQw';

    const token = localStorage.getItem('accessToken') || TEMP_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버 응답이 있는 경우
      switch (error.response.status) {
        case 401:
          // 인증 실패 - 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          break;
        case 403:
          console.error('접근 권한이 없습니다.');
          break;
        case 404:
          console.error('요청한 리소스를 찾을 수 없습니다.');
          break;
        case 500:
          console.error('서버 에러가 발생했습니다.');
          break;
        default:
          console.error('에러가 발생했습니다:', error.response.data);
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      console.error('서버로부터 응답이 없습니다.');
    } else {
      // 요청 설정 중 에러가 발생한 경우
      console.error('요청 중 에러가 발생했습니다:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
