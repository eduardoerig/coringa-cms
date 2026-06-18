"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, Search, IceCream, X, Save, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { ToastContainer } from "@/components/admin/ToastContainer";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Category {
  id: string;
  label: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  tag: string;
  image_url: string;
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
  categories?: { label: string };
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const { toasts, addToast } = useToast();
  const { confirm, confirmState, respondConfirm } = useConfirm();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    image_url: "",
    category_id: "",
    is_featured: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(label)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      addToast(`Erro ao buscar produtos: ${error.message}`, "error");
    }

    if (data) setProducts(data);
    setLoading(false);
  }, [supabase, addToast]);

  useEffect(() => {
    void (async () => {
      const { data: cats } = await supabase.from('categories').select('*');
      if (cats) setCategories(cats);
      await fetchProducts();
    })();
  }, [supabase, fetchProducts]);

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Excluir produto?",
      message: "Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
      variant: "danger",
    });
    if (ok) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        addToast(`Erro ao excluir produto: ${error.message}`, "error");
        console.error(error);
      } else {
        addToast("Produto excluído.");
        fetchProducts();
      }
    }
  }

  function openCreateModal() {
    setModalMode("create");
    setEditingProduct(null);
    setFormData({
      title: "", description: "", tag: "", image_url: "", category_id: categories[0]?.id || "", is_featured: false
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setModalMode("edit");
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      tag: product.tag || "",
      image_url: product.image_url || "",
      category_id: product.category_id || "",
      is_featured: product.is_featured || false
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  }

  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro ao subir imagem:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async function handleSaveProduct() {
    if (!formData.title.trim()) {
      addToast("O nome do produto é obrigatório.", "error");
      return;
    }

    setIsSaving(true);

    let finalImageUrl = formData.image_url;

    if (selectedFile) {
      setUploadProgress(true);
      const uploadedUrl = await uploadImage(selectedFile);
      setUploadProgress(false);

      if (!uploadedUrl) {
        addToast("Erro ao fazer upload da imagem. O produto não foi salvo.", "error");
        setIsSaving(false);
        return;
      }
      finalImageUrl = uploadedUrl;
    }

    const payload = {
      ...formData,
      image_url: finalImageUrl,
      category_id: formData.category_id === "" ? null : formData.category_id
    };

    let errorResult;

    if (modalMode === "create") {
      const { error } = await supabase.from('products').insert([payload]);
      errorResult = error;
    } else if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      errorResult = error;
    }

    setIsSaving(false);

    if (errorResult) {
      addToast(`Erro ao salvar produto: ${errorResult.message}`, "error");
      console.error('Supabase error:', errorResult);
    } else {
      setIsModalOpen(false);
      addToast(modalMode === "create" ? "Produto criado com sucesso!" : "Produto atualizado!");
      fetchProducts();
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const search = searchTerm.toLowerCase();
      return (
        product.title.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search) ||
        product.tag?.toLowerCase().includes(search) ||
        product.categories?.label.toLowerCase().includes(search)
      );
    });
  }, [products, searchTerm]);

  return (
    <>
    <div className="max-w-6xl mx-auto p-4 pt-24 md:p-10 md:pt-24 space-y-6 overflow-y-auto h-full custom-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-text-900 tracking-tight">Produtos</h1>
          <p className="text-text-500 mt-1">Gerencie os itens do cardápio e os destaques.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="bg-white border border-text-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-text-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-text-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <span className="text-xs text-text-400 font-medium whitespace-nowrap">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 text-text-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Tag</th>
                <th className="px-6 py-4 font-medium text-center">Destaque</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Carregando produtos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-text-400">Nenhum produto encontrado.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-50 rounded-lg flex items-center justify-center p-1 border border-text-100">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.title} width={48} height={48} className="max-h-full object-contain drop-shadow-sm" />
                          ) : (
                            <IceCream className="w-6 h-6 text-text-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-text-900 text-sm">{product.title}</p>
                          <p className="text-text-400 text-xs mt-0.5 line-clamp-1 max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-500">
                      <span className="bg-text-100/50 px-2.5 py-1 rounded-md">{product.categories?.label || 'Sem categoria'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.tag ? (
                        <span className="text-primary text-xs font-bold uppercase tracking-wider">{product.tag}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.is_featured ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15 text-green-400">✓</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1C1C2E] text-[#64748B]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          aria-label={`Editar produto ${product.title}`}
                          className="p-2 text-text-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          aria-label={`Excluir produto ${product.title}`}
                          className="p-2 text-text-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-text-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-900">
                {modalMode === 'create' ? 'Novo Produto' : 'Editar Produto'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-400 hover:text-text-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-text-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-text-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-700 mb-1">Categoria</label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-4 py-2 border border-text-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-700 mb-1">Tag (ex: Novidade)</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={e => setFormData({...formData, tag: e.target.value})}
                    className="w-full px-4 py-2 border border-text-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-700 mb-1">Imagem do Produto</label>
                <div className="flex flex-col gap-3">
                  {(selectedFile || formData.image_url) && (
                    <div className="relative w-full h-40 bg-surface-50 rounded-xl border border-text-100 overflow-hidden group">
                      <Image
                        src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image_url}
                        alt={formData.title ? `Preview de ${formData.title}` : "Preview da imagem do produto"}
                        fill
                        className="object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFormData({...formData, image_url: ""});
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur shadow-sm rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          addToast("Arquivo muito grande. Máximo: 5 MB.", "error");
                          return;
                        }
                        setSelectedFile(file);
                        setFormData(prev => ({ ...prev, image_url: "" }));
                      }}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-text-200 rounded-xl hover:border-primary hover:bg-surface-50 transition-all cursor-pointer group"
                    >
                      <Upload className="w-5 h-5 text-text-400 group-hover:text-primary" />
                      <span className="text-sm font-bold text-text-600 group-hover:text-primary">
                        {selectedFile ? 'Alterar Imagem' : 'Selecionar Imagem do Computador'}
                      </span>
                    </label>
                    <p className="text-[10px] text-text-400 mt-1 px-1">
                      * PNG, JPG ou WebP, máx. 5 MB. Preferência por fundo transparente (PNG), resolução 800×800px.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-px bg-text-100 flex-1"></div>
                    <span className="text-[10px] uppercase font-bold text-text-300">ou use um link externo</span>
                    <div className="h-px bg-text-100 flex-1"></div>
                  </div>

                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={e => {
                      setFormData({...formData, image_url: e.target.value});
                      if (e.target.value) setSelectedFile(null);
                    }}
                    placeholder="https://exemplo.com/imagem.png"
                    className="w-full px-4 py-2 border border-text-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-4 h-4 text-primary focus:ring-primary border-text-200 rounded"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-text-700 cursor-pointer">
                  Produto em Destaque (Aparece na Home)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-text-100 bg-surface-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-text-600 hover:bg-text-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSaving || uploadProgress}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSaving || uploadProgress ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {uploadProgress ? 'Subindo Imagem...' : isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} />
      <ConfirmDialog state={confirmState} onRespond={respondConfirm} />
    </>
  );
}
