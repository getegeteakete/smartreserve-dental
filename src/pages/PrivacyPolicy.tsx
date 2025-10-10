
import Header from "@/components/Header";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. 個人情報の取り扱いについて</h2>
              <p className="text-gray-700 leading-relaxed">
                六本松矯正歯科クリニックとよしま（以下「当院」といいます）では、患者様の個人情報の保護に関して、以下のとおりプライバシーポリシーを定め、個人情報保護の仕組みを構築し、個人情報保護の重要性の認識と取組みを徹底することにより、個人情報の保護を推進致します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 個人情報の収集・利用目的</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                当院では、以下の目的のために個人情報を収集・利用いたします：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>診療サービスの提供</li>
                <li>診療記録の作成・管理</li>
                <li>予約の管理・確認</li>
                <li>治療費の請求・管理</li>
                <li>緊急時の連絡</li>
                <li>診療に関するご案内・お知らせ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">3. 個人情報の第三者への開示・提供</h2>
              <p className="text-gray-700 leading-relaxed">
                当院では、患者様より同意をいただいた場合や法令に基づく場合を除き、取得した個人情報を第三者に開示または提供することはございません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. 個人情報の安全対策</h2>
              <p className="text-gray-700 leading-relaxed">
                当院では、個人情報の正確性及び安全性確保のために、セキュリティに万全の対策を講じております。不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、適切な管理を実施しております。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Cookie（クッキー）について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サイトでは、サービス向上のためCookieを使用する場合があります。Cookieの使用を希望されない場合は、ブラウザの設定でCookieを無効にすることができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">6. 個人情報の開示・訂正・削除</h2>
              <p className="text-gray-700 leading-relaxed">
                患者様ご本人が個人情報の照会・修正・削除などをご希望される場合には、ご本人であることを確認の上、対応させていただきます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">7. お問い合わせ</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">個人情報の取扱いに関するお問い合わせは下記までご連絡ください：</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">六本松矯正歯科クリニックとよしま</p>
                  <p>電話：092-406-2119</p>
                  <p>住所：福岡県福岡市中央区六本松2-11-30</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">8. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 leading-relaxed">
                当プライバシーポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、患者様に事前の通知をすることなく、変更することがあります。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">最終更新日：2025年6月10日</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer removed for demo */}
    </div>
  );
}
