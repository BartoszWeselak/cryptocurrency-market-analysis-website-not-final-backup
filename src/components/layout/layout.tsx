import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "~/components/Button";
import Modal from "../Modal";
import { useState } from "react";
import CreateUser from "../CreateUser";
import Image from "next/image";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="container m-8 mx-auto flex min-h-screen flex-col  items-center rounded  bg-gray-100 py-24 shadow-2xl">
        {children}
      </main>
      <Footer />
    </>
  );
};

const Header: React.FC = () => {
  const { data: session } = useSession();
  // const [isOpen, setIsOpen] = useState(false);
  // const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
  // const [isOpenRegisterModal, setIsOpenRegisterModal] = useState(false);

  return (
    <header className=" left-0 right-0 top-0 flex h-16 items-center justify-between bg-blue-500 px-4">
      <div className="flex items-center">
        <Link href={"/"}>Logo</Link>
      </div>

      <div className="flex items-center ">
        {session && session.user.role === "ADMIN" && (
          <Link
            className="rounded-lg border border-blue-300 bg-white p-4"
            href={"/admin/dashboard"}
          >
            Admin Panel
          </Link>
        )}
        {/* <Image
          src={session?.user.image ?? ""}
          alt=""
          width={100}
          height={100}
        /> */}
        {!session && (
          <Button
            className="mx-2 rounded-lg border border-blue-300 bg-white p-4"
            onClick={
              // () => setIsOpenLoginModal(true)
              () => signIn()
            }
          >
            Login
          </Button>
        )}
        {/* <Modal
          isOpen={isOpenLoginModal}
          onClose={() => setIsOpenLoginModal(false)}
        >
          <h2>Login</h2>
          <p>Please selecect login method</p>
          <Button className="mx-2" onClick={() => signIn()}>
            LoginButtonDiscord
          </Button>
        </Modal> */}
        {!session && (
          <Button
            className="mx-2"
            onClick={
              () => signIn()
              // onClick={() => setIsOpenRegisterModal(true)
            }
          ></Button>
        )}
        {/* <Modal
          isOpen={isOpenRegisterModal}
          onClose={() => setIsOpenRegisterModal(false)}
        >
          <h2>Second Modal Content</h2>
          <p>This is the second modal dialog.</p>
        </Modal> */}

        {session && (
          <Button
            className="mx-2 rounded-lg border border-blue-300 bg-white p-4"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  const { data: session } = useSession();

  return (
    <footer className="bg-blue-500">
      <div className="flex flex-col">
        <p>footer</p>
        <p>
          {session ? `Logged in as: ${session.user.role}` : "Not logged in"}
        </p>
      </div>
    </footer>
  );
};

export default Layout;

/*
          <Button className="mx-2" onClick={() => signIn("discord")}>
            LoginButton
          </Button>

*/
