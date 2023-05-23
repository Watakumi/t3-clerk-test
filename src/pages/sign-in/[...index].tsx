import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="container mx-auto">
      <p>hoge</p>
      <SignIn
        appearance={{
          elements: {
            rootBox: {
              width: "100%",
            },
            card: {
              boxShadow: "none",
              width: "100%",
            },
          },
        }}
      />
    </div>
  );
}
