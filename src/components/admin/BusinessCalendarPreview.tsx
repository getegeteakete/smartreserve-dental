
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BusinessCalendar } from "@/components/BusinessCalendar";
import { Copy, Eye, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const BusinessCalendarPreview = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const { toast } = useToast();

  const embedCode = `<iframe 
  src="${window.location.origin}/calendar-month-embed" 
  width="100%" 
  height="600" 
  frameborder="0" 
  scrolling="no"
  title="診療日カレンダー">
</iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "コピー完了",
      description: "埋め込みコードをクリップボードにコピーしました",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>診療日カレンダー - WordPress埋め込み用</CardTitle>
          <CardDescription>
            WordPressサイトに埋め込み可能な診療日カレンダーです。稼働日はピンク色、休診日は薄い青色で表示されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "プレビューを閉じる" : "プレビューを表示"}
            </Button>
            <Button 
              onClick={() => setShowEmbedCode(!showEmbedCode)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
              {showEmbedCode ? "埋め込みコードを閉じる" : "埋め込みコード表示"}
            </Button>
          </div>

          {showPreview && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">カレンダープレビュー</h3>
              <BusinessCalendar />
            </div>
          )}

          {showEmbedCode && (
            <div className="space-y-3">
              <Label htmlFor="embed-code">WordPress埋め込み用HTMLコード</Label>
              <div className="relative">
                <Textarea
                  id="embed-code"
                  value={embedCode}
                  readOnly
                  className="font-mono text-sm min-h-[120px]"
                />
                <Button
                  onClick={copyEmbedCode}
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <Copy className="h-4 w-4" />
                  コピー
                </Button>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>使用方法：</strong></p>
                <p>1. 上記のHTMLコードをコピー</p>
                <p>2. WordPressの投稿・固定ページでHTMLブロックを追加</p>
                <p>3. コピーしたコードを貼り付け</p>
                <p>4. 公開・更新してカレンダーが表示されることを確認</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
