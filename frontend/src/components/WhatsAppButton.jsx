const WHATSAPP_NUMBER = "2349168050906";

const message =
    "Hello Sought After Botaceutical (SAB)! 👋\n\n" +
    "I visited your website and would like to make an enquiry about " +
    "your botanical products, ingredients, research, or business services.\n\n" +
    "Please provide me with more information. Thank you!";

const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

function WhatsAppButton() {
    return (
        <a
            className="sa-floating-whatsapp"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Sought After Botaceutical on WhatsApp"
            title="Chat with us on WhatsApp"
        >
            <svg
                viewBox="0 0 32 32"
                width="27"
                height="27"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d="M16.02 3C8.85 3 3.02 8.81 3.02 15.96c0 2.29.6 4.53 1.75 6.5L3 29l6.73-1.76a13.05 13.05 0 0 0 6.28 1.6h.01C23.19 28.84 29 23.03 29 15.89A12.92 12.92 0 0 0 16.02 3Zm0 23.67h-.01a10.8 10.8 0 0 1-5.5-1.5l-.39-.23-3.99 1.04 1.07-3.88-.25-.4a10.7 10.7 0 0 1-1.65-5.74c0-5.93 4.82-10.75 10.76-10.75 2.87 0 5.57 1.12 7.6 3.15a10.68 10.68 0 0 1 3.15 7.59c0 5.93-4.83 10.72-10.79 10.72Zm5.9-8.03c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.59-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.57.16-.19.22-.32.32-.54.11-.22.06-.41-.03-.57-.08-.16-.73-1.76-1-2.4-.26-.62-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.13 1.1-1.13 2.67s1.16 3.09 1.32 3.3c.16.22 2.28 3.48 5.53 4.88.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.54.27-.76.27-1.41.19-1.54-.08-.14-.3-.22-.62-.38Z" />
            </svg>

            <span>Chat with us</span>
        </a>
    );
}

export default WhatsAppButton;
