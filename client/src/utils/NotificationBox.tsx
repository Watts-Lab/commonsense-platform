import { useTranslation } from "react-i18next";

function NotificationBox({ userEmail }: { userEmail: string }) {
  const { t } = useTranslation();

  return (
    <a
      href="#"
      className="w-full text-center group block mx-auto rounded-lg p-6 bg-green-600 ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-green-800 hover:ring-sky-500"
    >
      <div className="space-x-3">
        <h3 className="text-white group-hover:text-white text-sm font-semibold">
          {/* Welcome */}
          {t("notification.welcome")}
        </h3>
      </div>
      <p className="text-white group-hover:text-white text-sm">
        {/* An email with your verification link has been sent to {userEmail}.
        Please click on the link to verify your email. */}
        {t("notification.text", { email: userEmail })}
      </p>
    </a>
  );
}

export default NotificationBox;
