      {/* نافذة إنشاء خطة علاجية مبسطة */}
      {showToothTreatmentModal && selectedToothForChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">خطة علاجية شاملة للسن {selectedToothForChart}</h3>
                <Button
                  onClick={() => setShowToothTreatmentModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-green-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* حالة السن */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-3">حالة السن</h4>
                <select
                  value={treatmentFormData.toothCondition}
                  onChange={(e) => updateFormField('toothCondition', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر حالة السن...</option>
                  <option value="healthy">سليم</option>
                  <option value="cavity">تسوس</option>
                  <option value="cracked">مشقوق</option>
                  <option value="broken">مكسور</option>
                  <option value="infected">مصاب بعدوى</option>
                </select>
              </div>

              {/* نوع العلاج */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-900 mb-3">نوع العلاج</h4>
                <select
                  value={treatmentFormData.treatmentType}
                  onChange={(e) => updateFormField('treatmentType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">اختر نوع العلاج...</option>
                  <option value="filling">حشو</option>
                  <option value="root_canal">علاج عصب</option>
                  <option value="crown">تاج</option>
                  <option value="extraction">خلع</option>
                  <option value="cleaning">تنظيف</option>
                </select>
              </div>

              {/* ملاحظات */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">ملاحظات</h4>
                <textarea
                  value={treatmentFormData.initialNotes}
                  onChange={(e) => updateFormField('initialNotes', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  placeholder="أدخل ملاحظات حول حالة السن والعلاج المطلوب..."
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowToothTreatmentModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSaveEnhancedTreatment}
                >
                  <Save className="w-4 h-4 mr-2" />
                  حفظ الخطة
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}