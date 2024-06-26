import SignUpForm from "@/components/sign-up-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const SignUp = async () => {
  const session = await auth();
  if (session) return redirect("/");
  return (
    <section className="h-[90vh] w-full flex items-center justify-center">
      <div className="w-[500px] rounded-lg md:border bg-card text-card-foreground md:shadow-sm">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </div>
    </section>
  );
};

export default SignUp;
