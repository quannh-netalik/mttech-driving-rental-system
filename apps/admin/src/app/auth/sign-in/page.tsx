import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/field';
import LogoMTTech from '@workspace/ui/components/logo-mt-tech';
import { Separator } from '@workspace/ui/components/separator';
import { Input } from '@workspace/ui/components/textfield';

export default function LoginPage() {
  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        action=""
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home" className="flex gap-5 text-center justify-center">
              <LogoMTTech size={100} />
            </Link>
            <h1 className="text-center text-lg font-semibold text-foreground dark:text-foreground pb-1">
              Miền Trung Tech - Admin
            </h1>
            <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
              Đăng nhập để truy cập phần mềm quản lý
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Đăng nhập</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input type="email" required name="email" id="email" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-sm">
                  Mật Khẩu
                </Label>
              </div>
              <Input type="password" required name="pwd" id="pwd" className="input sz-md variant-mixed" />
            </div>

            <Button type="submit" className="mt-4 w-full py-2 font-medium">
              Đăng nhập
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground"></span>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground dark:text-muted-foreground">
              <p className="mt-4">Tổng Cục Hậu Cần - Kỹ Thuật</p>
              <p className="mt-2">Trường Trung Cấp Kỹ Thuật Miền Trung</p>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
