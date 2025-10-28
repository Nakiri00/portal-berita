import React from 'react';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog'; 

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    articleTitle: string;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    articleTitle,
}) => {
    return (
       <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center text-red-600">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Konfirmasi Penghapusan Permanen
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Anda yakin ingin menghapus artikel <b>"{articleTitle}"</b>?
                        <br /><br />
                        Tindakan ini <b>TIDAK DAPAT DIBATALKAN</b>. Semua data terkait (riwayat bacaan, bookmark, dan gambar) akan dihapus dari server secara permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100"
                        >
                            Batal
                        </button>
                        </AlertDialogCancel>
                    <AlertDialogAction asChild>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Ya, Hapus Sekarang
                    </button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
