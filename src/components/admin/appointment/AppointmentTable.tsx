import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AppointmentTableRow } from "./AppointmentTableRow";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatTimeSlotJapanese } from "@/utils/timeFormatUtils";

interface AppointmentPreference {
  id: string;
  preference_order: number;
  preferred_date: string;
  preferred_time_slot: string;
}

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  age: number;
  notes: string;
  treatment_name: string;
  fee: number;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
  created_at: string;
  appointment_preferences?: AppointmentPreference[];
}

interface AppointmentTableProps {
  appointments: Appointment[];
  selectedAppointments?: Set<string>;
  onCheckboxChange?: (appointmentId: string, checked: boolean) => void;
  onQuickApproval?: (appointment: Appointment) => void;
  onApproval?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  onStatusChange?: (appointment: Appointment) => void;
  onPreferenceApproval?: (appointment: Appointment, preferenceId: string) => void;
  getStatusBadge?: (appointment: Appointment) => React.ReactNode;
  showCheckboxes?: boolean;
  showStatusColumn?: boolean;
  showDetailedView?: boolean;
  tableClassName?: string;
}

export function AppointmentTable({
  appointments,
  selectedAppointments,
  onCheckboxChange,
  onQuickApproval,
  onApproval,
  onCancel,
  onEdit,
  onDelete,
  onStatusChange,
  onPreferenceApproval,
  getStatusBadge,
  showCheckboxes = false,
  showStatusColumn = true,
  showDetailedView = false,
  tableClassName,
}: AppointmentTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // スマホ版：カード形式で表示
    return (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{appointment.patient_name}</h3>
                <p className="text-sm text-gray-600">{appointment.treatment_name}</p>
              </div>
              {showCheckboxes && onCheckboxChange && (
                <Checkbox
                  checked={selectedAppointments?.has(appointment.id)}
                  onCheckedChange={(checked) => onCheckboxChange(appointment.id, checked as boolean)}
                />
              )}
            </div>
            
            {showStatusColumn && getStatusBadge && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">ステータス</span>
                {getStatusBadge(appointment)}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">電話:</span>
                <p className="font-medium">{appointment.phone}</p>
              </div>
              <div>
                <span className="text-gray-500">料金:</span>
                <p className="font-medium">¥{appointment.fee.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="text-sm">
              <span className="text-gray-500">申込日:</span>
              <p className="font-medium">
                {(() => {
                  // タイムゾーン変換を避けるため、日付文字列を直接解析
                  const datePart = appointment.created_at.split('T')[0];
                  const [year, month, day] = datePart.split('-');
                  return `${year}/${month}/${day}`;
                })()}
              </p>
            </div>

            {/* 詳細表示モードの場合は希望日時も表示 */}
            {showDetailedView && appointment.status === 'pending' && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <h4 className="font-medium text-sm mb-2">希望日時から選択して承認</h4>
                {appointment.appointment_preferences && appointment.appointment_preferences.length > 0 ? (
                  <div className="space-y-2">
                    {appointment.appointment_preferences
                      .sort((a, b) => a.preference_order - b.preference_order)
                      .map((pref) => {
                        const prefDate = new Date(pref.preferred_date);
                        const formattedDate = prefDate.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        });
                        const formattedTime = formatTimeSlotJapanese(pref.preferred_time_slot);
                        
                        return (
                          <div key={pref.id} className="flex justify-between items-center text-sm">
                            <span>
                              第{pref.preference_order}希望: {formattedDate} {formattedTime}
                            </span>
                            {onPreferenceApproval && (
                              <button
                                onClick={() => onPreferenceApproval(appointment, pref.id)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                この日時で承認
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      希望日時が登録されていません。
                    </p>
                  </div>
                )}
              </div>
            )}

            <AppointmentTableRow
              appointment={appointment}
              isSelected={selectedAppointments?.has(appointment.id)}
              onCheckboxChange={onCheckboxChange}
              onQuickApproval={onQuickApproval}
              onApproval={onApproval}
              onCancel={onCancel}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              getStatusBadge={getStatusBadge}
              showCheckbox={false}
              showStatus={false}
              showEmail={false}
              rowClassName="p-0 border-0"
              isMobileCard={true}
            />
          </div>
        ))}
      </div>
    );
  }

  // デスクトップ版：テーブル形式
  if (showDetailedView) {
    // 詳細表示モード
    return (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">患者名</span>
                    <p className="font-medium">{appointment.patient_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">電話番号</span>
                    <p className="font-medium">{appointment.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">診療内容</span>
                    <p className="font-medium">{appointment.treatment_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">料金</span>
                    <p className="font-medium">¥{appointment.fee.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showCheckboxes && onCheckboxChange && (
                  <Checkbox
                    checked={selectedAppointments?.has(appointment.id)}
                    onCheckedChange={(checked) => onCheckboxChange(appointment.id, checked as boolean)}
                  />
                )}
                {showStatusColumn && getStatusBadge && getStatusBadge(appointment)}
              </div>
            </div>
            
            {appointment.status === 'pending' && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <h4 className="font-medium mb-3">希望日時から選択して承認</h4>
                {appointment.appointment_preferences && appointment.appointment_preferences.length > 0 ? (
                  <div className="space-y-2">
                    {appointment.appointment_preferences
                      .sort((a, b) => a.preference_order - b.preference_order)
                      .map((pref) => {
                        const prefDate = new Date(pref.preferred_date);
                        const formattedDate = prefDate.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        });
                        const formattedTime = formatTimeSlotJapanese(pref.preferred_time_slot);
                        
                        return (
                          <div key={pref.id} className="flex justify-between items-center p-2 bg-white rounded border">
                            <span className="flex-1">
                              第{pref.preference_order}希望: {formattedDate} {formattedTime}
                            </span>
                            {onPreferenceApproval && (
                              <button
                                onClick={() => onPreferenceApproval(appointment, pref.id)}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              >
                                この日時で承認
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      希望日時が登録されていません。編集ボタンから希望日時を設定してください。
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-end space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(appointment)}
                  className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  編集
                </button>
              )}
              {onCancel && (
                <button
                  onClick={() => onCancel(appointment)}
                  className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 通常のテーブル表示
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && <TableHead className="w-12">選択</TableHead>}
            {showStatusColumn && <TableHead>ステータス</TableHead>}
            <TableHead>患者名</TableHead>
            <TableHead>電話番号</TableHead>
            {showStatusColumn && <TableHead>メール</TableHead>}
            <TableHead>診療内容</TableHead>
            <TableHead>料金</TableHead>
            <TableHead>申込日</TableHead>
            <TableHead>希望日時</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <>
              <AppointmentTableRow
                key={appointment.id}
                appointment={appointment}
                isSelected={selectedAppointments?.has(appointment.id)}
                onCheckboxChange={onCheckboxChange}
                onQuickApproval={onQuickApproval}
                onApproval={onApproval}
                onCancel={onCancel}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                getStatusBadge={getStatusBadge}
                showCheckbox={showCheckboxes}
                showStatus={showStatusColumn}
                showEmail={showStatusColumn}
                rowClassName={tableClassName ? "bg-white" : undefined}
                appointment_preferences={appointment.appointment_preferences}
                onPreferenceApproval={onPreferenceApproval}
              />
              {/* 希望日時を表示する展開行（承認待ちの場合のみ） */}
              {appointment.status === 'pending' && appointment.appointment_preferences && appointment.appointment_preferences.length > 0 && (
                <TableRow key={`${appointment.id}-preferences`} className="bg-gray-50">
                  <TableCell colSpan={showCheckboxes ? (showStatusColumn ? 10 : 8) : (showStatusColumn ? 9 : 7)}>
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-2">希望日時から選択して承認</h4>
                      <div className="flex flex-wrap gap-2">
                        {appointment.appointment_preferences
                          .sort((a, b) => a.preference_order - b.preference_order)
                          .map((pref) => {
                            const prefDate = new Date(pref.preferred_date);
                            const formattedDate = prefDate.toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'long'
                            });
                            const formattedTime = formatTimeSlotJapanese(pref.preferred_time_slot);
                            
                            return (
                              <div key={pref.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                                <span className="text-sm">
                                  第{pref.preference_order}希望: {formattedDate} {formattedTime}
                                </span>
                                {onPreferenceApproval && (
                                  <Button
                                    size="sm"
                                    onClick={() => onPreferenceApproval(appointment, pref.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                                  >
                                    この日時で承認
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
