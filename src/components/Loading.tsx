export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                <p className="text-lg text-white font-medium">Loading...</p>
            </div>
        </div>
    );
}
