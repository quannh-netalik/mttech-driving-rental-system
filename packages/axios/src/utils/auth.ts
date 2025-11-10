const ACCESS_TOKEN = 'access_token';

const getAccessToken = () => {
	return localStorage.getItem(ACCESS_TOKEN);
};

const setAccessToken = (token: string) => {
	localStorage.setItem(ACCESS_TOKEN, token);
};

const removeAccessToken = () => {
	localStorage.removeItem(ACCESS_TOKEN);
};

export const localStorageServices = {
	getAccessToken,
	setAccessToken,
	removeAccessToken,
};
