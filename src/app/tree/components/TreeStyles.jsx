// Shared styles for the tree components
const TreeStyles = () => (
    <style jsx global>{`
        .text-shadow {
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
        }

        @keyframes bounce-custom {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.15);
            }
            100% {
                transform: scale(1);
            }
        }

        .animate-bounce-custom {
            animation: bounce-custom 0.3s ease-out;
        }
    `}</style>
);

export default TreeStyles;