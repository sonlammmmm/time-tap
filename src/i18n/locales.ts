export interface Translation {
  title: string;
  hintIdle: string;
  hintPause: string;
  hintEnd: string;
  btnExtend: string;
  btnPause: string;
  btnResume: string;
  btnRotate: string;
  btnFullscreen: string;
  btnSettings: string;
  settingsTitle: string;
  rowDur: string;
  rowExt: string;
  rowThreshold: string;
  colorWarn: string;
  colorCrit: string;
  secUnit: string;
  extOff: string;
  soundSectionTitle: string;
  warnSoundTitle: string;
  timeUpSoundTitle: string;
  soundModeSynth: string;
  soundModeTTS: string;
  soundModeRecord: string;
  recordStart: string;
  recordStop: string;
  recordTest: string;
  recordDelete: string;
  recordUpload: string;
  recordStatusHas: string;
  recordStatusEmpty: string;
  recordPromptWarn: string;
  recordPromptTimeUp: string;
  togSound: string;
  togBuzz: string;
  togVib: string;
  togWake: string;
  togBar: string;
  langLabel: string;
  close: string;
  shortcutsNote: string;
  iosTip: string;
  ttsWarningText: string;
  ttsTimeUpText: string;
  ttsExtensionText: string;
}

export const translations: Record<'vi' | 'en', Translation> = {
  vi: {
    title: 'Poker Shot Clock',
    hintIdle: 'CHẠM VÀO MÀN HÌNH ĐỂ BẮT ĐẦU',
    hintPause: 'TẠM DỪNG — CHẠM ĐỂ CHẠY LẠI',
    hintEnd: 'HẾT GIỜ — CHẠM ĐỂ BẮT ĐẦU VÁN MỚI',
    btnExtend: 'Gia hạn',
    btnPause: 'Tạm dừng',
    btnResume: 'Tiếp tục',
    btnRotate: 'Xoay màn hình',
    btnFullscreen: 'Toàn màn hình',
    btnSettings: 'Cài đặt',
    settingsTitle: 'CÀI ĐẶT SHOT CLOCK',
    rowDur: 'Thời gian mỗi lượt (Shot Clock Length)',
    rowExt: 'Thẻ gia hạn thêm giờ (Time Extension)',
    rowThreshold: 'Mốc thời gian đổi màu cảnh báo',
    colorWarn: 'Vàng cảnh báo',
    colorCrit: 'Đỏ khẩn cấp',
    secUnit: 'giây',
    extOff: 'Tắt',
    soundSectionTitle: 'TÙY CHỈNH ÂM THANH & GHI ÂM',
    warnSoundTitle: 'Âm thanh cảnh báo sắp hết giờ',
    timeUpSoundTitle: 'Âm thanh khi hết giờ (Time-up)',
    soundModeSynth: 'Beep điện tử chuẩn',
    soundModeTTS: 'Giọng đọc tự động',
    soundModeRecord: 'Ghi âm tùy chỉnh riêng',
    recordStart: '🎙️ Ghi âm',
    recordStop: '⏹️ Dừng & Lưu',
    recordTest: '▶️ Nghe thử',
    recordDelete: '🗑️ Xóa bản ghi',
    recordUpload: '📁 Tải file âm thanh',
    recordStatusHas: '✓ Đã có bản ghi âm',
    recordStatusEmpty: 'Chưa có bản ghi âm',
    recordPromptWarn: 'Ghi âm giọng bạn (VD: "Còn 10 giây", "Nhanh tay lên")',
    recordPromptTimeUp: 'Ghi âm tiếng hết giờ (VD: "Hết giờ! Fold bài")',
    togSound: 'Tiếng beep cảnh báo & đếm tích tắc từng giây',
    togBuzz: 'Còi báo hết giờ (Tournament Buzzer)',
    togVib: 'Rung phản hồi khi bấm & khi báo giờ (Vibration)',
    togWake: 'Giữ màn hình luôn sáng (Keep screen awake)',
    togBar: 'Thanh tiến trình chạy ở đáy màn hình',
    langLabel: 'Ngôn ngữ (Language)',
    close: 'Lưu & Đóng',
    shortcutsNote: 'Phím tắt: [Space/Enter] Bắt đầu/Chạy lại · [P] Tạm dừng · [E] Gia hạn · [R] Xoay ngang · [F] Toàn màn hình · [S] Cài đặt',
    iosTip: 'Mẹo iPhone: Thêm vào Màn hình chính (Add to Home Screen) trong Safari để dùng toàn màn hình như ứng dụng cài đặt.',
    ttsWarningText: 'Cảnh báo, còn {n} giây',
    ttsTimeUpText: 'Hết giờ! Bỏ bài!',
    ttsExtensionText: 'Thêm thời gian',
  },
  en: {
    title: 'Poker Shot Clock',
    hintIdle: 'TAP THE SCREEN TO START',
    hintPause: 'PAUSED — TAP TO RESET AND START',
    hintEnd: 'TIME — TAP TO START AGAIN',
    btnExtend: 'Extend',
    btnPause: 'Pause',
    btnResume: 'Resume',
    btnRotate: 'Rotate the screen',
    btnFullscreen: 'Fullscreen',
    btnSettings: 'Settings',
    settingsTitle: 'SHOT CLOCK SETTINGS',
    rowDur: 'Shot clock length',
    rowExt: 'Extension — time extension card',
    rowThreshold: 'Colour change',
    colorWarn: 'amber',
    colorCrit: 'red',
    secUnit: 'sec',
    extOff: 'Off',
    soundSectionTitle: 'CUSTOM SOUNDS & RECORDING',
    warnSoundTitle: 'Warning alert sound',
    timeUpSoundTitle: 'Time-up buzzer / alert sound',
    soundModeSynth: 'Default synth tone',
    soundModeTTS: 'Voice announcement',
    soundModeRecord: 'Custom voice recording',
    recordStart: '🎙️ Record',
    recordStop: '⏹️ Stop & Save',
    recordTest: '▶️ Test',
    recordDelete: '🗑️ Delete',
    recordUpload: '📁 Upload audio file',
    recordStatusHas: '✓ Custom sound recorded',
    recordStatusEmpty: 'No custom recording',
    recordPromptWarn: 'Record your voice (e.g. "10 seconds remaining!")',
    recordPromptTimeUp: 'Record your voice (e.g. "Time\'s up! Hand is folded!")',
    togSound: 'Warning beep and last-second ticks',
    togBuzz: 'Time-up buzzer',
    togVib: 'Vibration (mobile)',
    togWake: 'Keep the screen awake',
    togBar: 'Progress line at the bottom',
    langLabel: 'Language',
    close: 'Close',
    shortcutsNote: 'Tap anywhere on the screen to reset and start again.\n[Space] reset · [P] pause · [E] extend · [R] rotate · [F] fullscreen · [S] settings',
    iosTip: 'iPhone Tip: Tap Share > "Add to Home Screen" in Safari for full-screen native app experience.',
    ttsWarningText: '{n} seconds remaining',
    ttsTimeUpText: 'Time is up! Fold!',
    ttsExtensionText: 'Time extension',
  }
};
