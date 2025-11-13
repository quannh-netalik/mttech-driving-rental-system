import { z } from 'zod';

export const regexEmail = /^(?=.{1,}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const regexPassword =
	/^(?=.*[a-zA-Z])(?=.*\d)(?!.*[ぁ-んァ-ヶー一-龠ａ-ｚＡ-Ｚ０-９])[a-zA-Z\d-_,.@#$%^&*/:;\\+]{3,30}$/;

export const vEmail = z
	.string({
		error: 'Vui lòng điền email',
	})
	.transform(data => data.trim())
	.refine(data => data.length > 0, {
		message: 'Vui lòng điền email',
	})
	.refine(data => regexEmail.test(data), {
		message: 'Vui lòng điền đúng định dạng email',
	})
	.refine(data => data.length < 257, {
		message: 'Email không được vượt quá 256 ký tự',
	});

export const vPassword = z
	.string({
		error: 'Vui lòng điền mật khẩu',
	})
	.refine(data => data.length >= 3, {
		message: 'Mật khẩu phải có ít nhất 3 ký tự',
	})
	.refine(data => data.length <= 30, {
		message: 'Mật khẩu không được vượt quá 30 ký tự',
	});
// .refine(data => regexPassword.test(data), {
// 	message: 'Mật khẩu chỉ bao gồm chữ cái, số và ký tự đặc biệt -_,.@#$%^&*/:;\\+',
// });
