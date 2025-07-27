'use client';

const LoadingTree = () => {
    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4">
                    <img
                        src="/svg/BgLeaves.svg"
                        alt="Tree Logo"
                        className="w-full h-full object-contain animate-pulse"
                    />
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    Loading Tree...
                </h2>
                <p className="text-gray-500">
                    Fetching latest data
                </p>
            </div>
        </div>
    );
};

export default LoadingTree;
