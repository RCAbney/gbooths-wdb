import React from 'react';
import { Link } from 'react-router-dom';

function NoBooths() {
    return (
        <div className="p-4 flex items-center justify-center h-[calc(100vh-70px)]">
            <Link
                to="/"
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation active:bg-gray-50"
                style={{ minHeight: '44px', WebkitTapHighlightColor: 'transparent' }}
            >
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    viewBox="0 0 45 45"
                    width="45"
                    height="45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g transform="scale(3)">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.5.9a6.6 6.6 0 0 0-5 11l-.9.7a.5.5 0 1 0 .8.8l.8-.9a6.6 6.6 0 0 0 9.3-9.3l.9-.8a.5.5 0 1 0-.8-.8l-.8.9A6.6 6.6 0 0 0 7.5.9Zm3.6 2.3c-1-.9-2.2-1.4-3.6-1.4a5.7 5.7 0 0 0-4.3 9.3l8-8ZM4 11.8c1 .9 2.2 1.4 3.6 1.4a5.7 5.7 0 0 0 4.3-9.3l-8 8Z"
                            fill="currentColor"
                        />
                    </g>
                </svg>

                <p className="mt-2 block text-med font-medium text-gray-900 px-7">
                    It doesn&rsquo;t look like you&rsquo;ve added any booths to visit yet.
                </p>
                <p className="mt-4 block text-sm font-medium text-gray-900 px-7">
                    Tap here or on View All in the menu to see all listed booths.
                </p>
            </Link>
        </div>
    );
}

export default NoBooths;
