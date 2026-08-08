import { useState, useRef } from 'react';
import { ArrowLeft, Camera, Check, X, Loader2 } from 'lucide-react';
import { addPhone, updatePhone } from '../../store/phoneStore';
import type { InventoryPhone, Condition, PhoneFormInput } from '../../store/phoneStore';
import { logActivity } from '../../store/activityStore';

interface PhoneFormScreenProps {
  phone?: InventoryPhone;
  onSave: () => void;
  onBack: () => void;
}

const CONDITIONS: Condition[] = ['Like New', 'Good', 'Fair', 'Poor'];
const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Vivo', 'Oppo', 'Xiaomi', 'Realme', 'Motorola', 'Nothing', 'Other'];
const RAM_OPTIONS = ['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB'];
const STORAGE_OPTIONS = ['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];
const ROM_OPTIONS = ['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];
const WARRANTY_OPTIONS = ['No warranty', '1 month', '3 months', '6 months', '1 year'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 14 }, (_, i) => CURRENT_YEAR - i);
const MAX_IMAGES = 6;

interface FormData {
  phoneName: string;
  brand: string;
  model: string;
  year: number;
  ram: string;
  storage: string;
  rom: string;
  colour: string;
  batteryHealth: number;
  condition: Condition;
  price: number;
  imeiNumber: string;
  imeiVerified: boolean;
  ceirVerified: boolean;
  billAvailable: boolean;
  originalCharger: boolean;
  warranty: string;
  description: string;
}

interface ImageSlot {
  key: string;
  url: string;       // object URL for new files, remote URL for existing
  file?: File;        // present only for newly-added images
  isExisting: boolean;
}

export default function PhoneFormScreen({ phone, onSave, onBack }: PhoneFormScreenProps) {
  const isEdit = !!phone;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    phoneName: phone?.phoneName ?? '',
    brand: phone?.brand ?? '',
    model: phone?.model ?? '',
    year: phone?.year ?? CURRENT_YEAR,
    ram: phone?.ram ?? '6 GB',
    storage: phone?.storage ?? '128 GB',
    rom: phone?.rom ?? '128 GB',
    colour: phone?.colour ?? '',
    batteryHealth: phone?.batteryHealth ?? 85,
    condition: phone?.condition ?? 'Good',
    price: phone?.price ?? 0,
    imeiNumber: phone?.imeiNumber ?? '',
    imeiVerified: phone?.imeiVerified ?? false,
    ceirVerified: phone?.ceirVerified ?? false,
    billAvailable: phone?.billAvailable ?? false,
    originalCharger: phone?.originalCharger ?? false,
    warranty: phone?.warranty ?? '3 months',
    description: phone?.description ?? '',
  });

  const [images, setImages] = useState<ImageSlot[]>(
    (phone?.images ?? []).map((url, i) => ({ key: `existing-${i}-${url}`, url, isExisting: true })),
  );

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>> & { images?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    const next: ImageSlot[] = files.map((file) => ({
      key: `new-${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));
    setImages((prev) => [...prev, ...next]);
    setErrors((prev) => ({ ...prev, images: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (key: string) => {
    setImages((prev) => prev.filter((img) => img.key !== key));
  };

  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> & { images?: string } = {};
    if (!form.phoneName.trim()) errs.phoneName = 'Phone name is required';
    if (!form.brand) errs.brand = 'Brand is required';
    if (!form.model.trim()) errs.model = 'Model is required';
    if (!form.colour.trim()) errs.colour = 'Colour is required';
    if (!form.price || form.price <= 0) errs.price = 'Enter a valid price';
    if (!form.imeiNumber || form.imeiNumber.length !== 15) errs.imeiNumber = 'Enter a valid 15-digit IMEI';
    if (images.length === 0) errs.images = 'Add at least one photo';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    setSaveError('');

    const input: PhoneFormInput = {
      phoneName: form.phoneName.trim(),
      brand: form.brand,
      model: form.model.trim(),
      year: form.year,
      ram: form.ram,
      storage: form.storage,
      rom: form.rom,
      colour: form.colour.trim(),
      batteryHealth: form.batteryHealth,
      condition: form.condition,
      price: form.price,
      imeiNumber: form.imeiNumber,
      imeiVerified: form.imeiVerified,
      ceirVerified: form.ceirVerified,
      billAvailable: form.billAvailable,
      originalCharger: form.originalCharger,
      warranty: form.warranty,
      description: form.description.trim(),
      status: phone?.status ?? 'available',
      existingImages: images.filter((i) => i.isExisting).map((i) => i.url),
      newImageFiles: images.filter((i) => !i.isExisting && i.file).map((i) => i.file!),
    };

    try {
      if (isEdit && phone) {
        await updatePhone(phone.id, input);
        logActivity('edited', form.brand, form.model, `Price ₹${form.price.toLocaleString()}`);
      } else {
        await addPhone(input);
        logActivity('added', form.brand, form.model, `₹${form.price.toLocaleString()} · ${form.condition}`);
      }
      setSaving(false);
      onSave();
    } catch (e) {
      setSaving(false);
      setSaveError(e instanceof Error ? e.message : 'Could not save this listing. Please try again.');
    }
  };

  const InputLabel = ({ label, required }: { label: string; required?: boolean }) => (
    <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5 block">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;

  const inputClass = (err?: string) =>
    `w-full h-11 bg-[#F5F7FA] rounded-xl px-4 text-sm text-[#1A1D1F] outline-none border transition-all ${err ? 'border-red-300' : 'border-transparent focus:border-[#1A73E8]'}`;

  return (
    <div className="screen-enter flex flex-col min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}
      >
        <button onClick={onBack} className="btn-tap w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft size={20} color="#1A1D1F" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#1A1D1F]">{isEdit ? 'Edit Phone' : 'Add New Phone'}</h1>
          <p className="text-xs text-[#6B7280]">{isEdit ? 'Update listing details' : 'List a phone for sale'}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-tap px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity flex items-center gap-1.5"
          style={{ background: '#1A73E8', opacity: saving ? 0.7 : 1 }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-10 space-y-5 pt-4">
        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
            {saveError}
          </div>
        )}

        {/* Photo Upload */}
        <div>
          <InputLabel label="Photos" required />
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div key={img.key} className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-[#E5E7EB]">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(img.key)}
                  className="btn-tap absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <X size={13} color="white" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-tap w-full aspect-square rounded-xl border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center gap-1.5 bg-white"
              >
                <Camera size={20} color="#9CA3AF" />
                <span className="text-[10px] font-medium text-[#9CA3AF]">Add photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <ErrorText msg={errors.images} />
        </div>

        {/* Phone Name */}
        <div>
          <InputLabel label="Phone Name" required />
          <input
            value={form.phoneName}
            onChange={(e) => update('phoneName', e.target.value)}
            placeholder="e.g. iPhone 13 Pro"
            className={inputClass(errors.phoneName)}
          />
          <ErrorText msg={errors.phoneName} />
        </div>

        {/* Brand */}
        <div>
          <InputLabel label="Brand" required />
          <div className="flex flex-wrap gap-2">
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => update('brand', b)}
                className="chip-tap px-3.5 py-2 rounded-full text-xs font-semibold border transition-all"
                style={{
                  background: form.brand === b ? '#1A73E8' : 'white',
                  color: form.brand === b ? 'white' : '#6B7280',
                  borderColor: form.brand === b ? '#1A73E8' : '#E5E7EB',
                }}
              >
                {b}
              </button>
            ))}
          </div>
          <ErrorText msg={errors.brand} />
        </div>

        {/* Model + Year */}
        <div className="flex gap-3">
          <div className="flex-1">
            <InputLabel label="Model" required />
            <input
              value={form.model}
              onChange={(e) => update('model', e.target.value)}
              placeholder="e.g. A2634"
              className={inputClass(errors.model)}
            />
            <ErrorText msg={errors.model} />
          </div>
          <div className="w-28">
            <InputLabel label="Year" required />
            <select
              value={form.year}
              onChange={(e) => update('year', Number(e.target.value))}
              className={inputClass()}
            >
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* RAM + Storage + ROM */}
        <div className="flex gap-3">
          <div className="flex-1">
            <InputLabel label="RAM" />
            <select value={form.ram} onChange={(e) => update('ram', e.target.value)} className={inputClass()}>
              {RAM_OPTIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <InputLabel label="Storage" />
            <select value={form.storage} onChange={(e) => update('storage', e.target.value)} className={inputClass()}>
              {STORAGE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <InputLabel label="ROM" />
            <select value={form.rom} onChange={(e) => update('rom', e.target.value)} className={inputClass()}>
              {ROM_OPTIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Colour */}
        <div>
          <InputLabel label="Colour" required />
          <input
            value={form.colour}
            onChange={(e) => update('colour', e.target.value)}
            placeholder="e.g. Midnight Black"
            className={inputClass(errors.colour)}
          />
          <ErrorText msg={errors.colour} />
        </div>

        {/* Condition */}
        <div>
          <InputLabel label="Condition" required />
          <div className="flex gap-2">
            {CONDITIONS.map((c) => {
              const color = { 'Like New': '#1A7A4A', 'Good': '#1A73E8', 'Fair': '#F59E0B', 'Poor': '#EF4444' }[c];
              return (
                <button
                  key={c}
                  onClick={() => update('condition', c)}
                  className="chip-tap flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
                  style={{
                    background: form.condition === c ? color + '14' : 'white',
                    color: form.condition === c ? color : '#6B7280',
                    borderColor: form.condition === c ? color : '#E5E7EB',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Battery Health */}
        <div>
          <InputLabel label={`Battery Health — ${form.batteryHealth}%`} />
          <input
            type="range"
            min={50}
            max={100}
            value={form.batteryHealth}
            onChange={(e) => update('batteryHealth', Number(e.target.value))}
            className="w-full accent-[#1A73E8]"
          />
          <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
            <span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        {/* Price */}
        <div>
          <InputLabel label="Asking Price (₹)" required />
          <input
            type="number"
            value={form.price || ''}
            onChange={(e) => update('price', Number(e.target.value))}
            placeholder="e.g. 25000"
            className={inputClass(errors.price)}
          />
          <ErrorText msg={errors.price} />
        </div>

        {/* IMEI */}
        <div>
          <InputLabel label="IMEI Number" required />
          <input
            value={form.imeiNumber}
            onChange={(e) => update('imeiNumber', e.target.value.replace(/\D/g, ''))}
            placeholder="15-digit IMEI"
            maxLength={15}
            inputMode="numeric"
            className={inputClass(errors.imeiNumber)}
          />
          <ErrorText msg={errors.imeiNumber} />
          <p className="text-[10px] text-[#9CA3AF] mt-1">Dial *#06# to find IMEI</p>
        </div>

        {/* Checkboxes */}
        <div>
          <InputLabel label="Accessories & Verification" />
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-[#F5F7FA]">
            {([
              { key: 'imeiVerified', label: 'IMEI Verified' },
              { key: 'ceirVerified', label: 'CEIR Verified' },
              { key: 'billAvailable', label: 'Original Bill Available' },
              { key: 'originalCharger', label: 'Original Charger Included' },
            ] as { key: keyof FormData; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => update(key, !form[key] as any)}
                className="flex items-center justify-between w-full px-4 py-3.5"
              >
                <span className="text-sm text-[#1A1D1F]">{label}</span>
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: form[key] ? '#1A73E8' : '#F5F7FA', border: `1.5px solid ${form[key] ? '#1A73E8' : '#D1D5DB'}` }}
                >
                  {form[key] && <Check size={13} color="white" strokeWidth={3} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Warranty */}
        <div>
          <InputLabel label="Warranty" />
          <select
            value={form.warranty}
            onChange={(e) => update('warranty', e.target.value)}
            className={inputClass()}
          >
            {WARRANTY_OPTIONS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <InputLabel label="Description" />
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Describe the condition, any scratches, screen quality, etc."
            rows={4}
            className="w-full bg-[#F5F7FA] rounded-xl px-4 py-3 text-sm text-[#1A1D1F] outline-none border border-transparent focus:border-[#1A73E8] resize-none"
          />
        </div>

        {/* Save Button (bottom) */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-tap w-full h-14 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', opacity: saving ? 0.7 : 1 }}
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Saving…' : isEdit ? 'Update Listing' : 'Add Listing'}
        </button>
      </div>
    </div>
  );
}
