import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, AlertTriangle, Users } from 'lucide-react';
import Header from '@/components/Header';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16 bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* ページタイトル */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">お問い合わせ</h1>
            <p className="text-gray-600 text-lg">
              システムに関するご質問やトラブルがございましたら、<br />
              開発チームまでご連絡ください。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 開発チーム情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  開発チーム
                </CardTitle>
                <CardDescription>
                  SmartReserve開発チーム
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">メールサポート</p>
                      <p className="text-sm text-gray-600">システム運用に関するお問い合わせ</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">技術問い合わせ</p>
                      <p className="text-sm text-gray-600">システム機能・技術的問題について</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">対応時間</h4>
                  <p className="text-sm text-gray-600">
                    平日 9:00 - 18:00<br />
                    （土日祝日は対応できません）
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 緊急時連絡先 */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  緊急時連絡先
                </CardTitle>
                <CardDescription>
                  システム障害・緊急トラブル対応
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">システム管理者</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    システムに重大な問題が発生した場合や、<br />
                    サービスが利用できない緊急事態の際は、<br />
                    下記までご連絡ください。
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">緊急連絡先: sup@ei-life.co.jp</span>
                    </div>
                    <p className="text-xs text-orange-600">
                      ※ 緊急時のみご利用ください
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <h5 className="font-medium mb-1">緊急時の対象</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• システムが完全に停止している</li>
                    <li>• 予約機能が利用できない</li>
                    <li>• データが消失した可能性がある</li>
                    <li>• セキュリティ上の問題が発生した</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* お問い合わせ前の確認事項 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>お問い合わせ前の確認事項</CardTitle>
              <CardDescription>
                お問い合わせいただく前に、以下の点をご確認ください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">システム利用について</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• ブラウザのキャッシュをクリアしてください</li>
                    <li>• 別のブラウザやデバイスで試してください</li>
                    <li>• インターネット接続を確認してください</li>
                    <li>• システムメンテナンス時間外かご確認ください</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-blue-700">予約機能について</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 希望日時が空いているかご確認ください</li>
                    <li>• 入力情報に誤りがないかご確認ください</li>
                    <li>• 確認メールが届かない場合、迷惑メールフォルダをご確認ください</li>
                    <li>• 予約制限により予約できない場合があります</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* サポート情報 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>サポート情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">システム情報</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-700">システム名</p>
                    <p className="text-blue-600">SmartReserve 予約システム</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">対象クリニック</p>
                    <p className="text-blue-600">六本松矯正歯科クリニックとよしま</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">最終更新</p>
                    <p className="text-blue-600">2024年1月</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
