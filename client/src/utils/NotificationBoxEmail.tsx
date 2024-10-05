function NotificationBoxEmail({ userEmail }: { userEmail: string }) {
  return (
    <a
      href="/"
      className="w-full text-center group block mx-auto rounded-lg p-6 bg-green-600 ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-green-800 hover:ring-sky-500"
    >
      <div className="space-x-3">
        <h3 className="text-white group-hover:text-white text-sm font-semibold">
          Thank you
        </h3>
      </div>
      <p className="text-white group-hover:text-white text-sm">
        We have record your email address {userEmail}. We will notify you when
        we are up again.
      </p>
    </a>
  );
}

export default NotificationBoxEmail;
