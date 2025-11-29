import { getCollection, type CollectionEntry } from 'astro:content';

export async function getAllNotebooks() {
  const notebooks = await getCollection('notebooks');
  return notebooks.sort((a: CollectionEntry<'notebooks'>, b: CollectionEntry<'notebooks'>) => a.data.order - b.data.order);
}

export async function getNotebookBySlug(slug: string) {
  const notebooks = await getCollection('notebooks');
  return notebooks.find((nb: CollectionEntry<'notebooks'>) => nb.slug === slug);
}

export async function getNotesByNotebook(notebookSlug: string) {
  const notes = await getCollection('notes');
  return notes
    .filter((note: CollectionEntry<'notes'>) => note.data.notebook === notebookSlug)
    .sort((a: CollectionEntry<'notes'>, b: CollectionEntry<'notes'>) => {
      // 先按 order 排序，再按日期排序
      if (a.data.order !== b.data.order) {
        return a.data.order - b.data.order;
      }
      return b.data.date.getTime() - a.data.date.getTime();
    });
}

export async function getAllNotes() {
  const notes = await getCollection('notes');
  return notes.sort((a: CollectionEntry<'notes'>, b: CollectionEntry<'notes'>) => b.data.date.getTime() - a.data.date.getTime());
}

