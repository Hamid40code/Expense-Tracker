import { Component } from "react";

import { ERROR_CODES, getErrorMessage, reportAppError } from "../../utils/errors.js";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        reportAppError(error, "React rendering failed");
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="app-error-screen" role="alert">
                    <div className="app-error-card">
                        <h1>Something went wrong</h1>
                        <p>{getErrorMessage(ERROR_CODES.UNKNOWN_ERROR)}</p>
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== "undefined") window.location.reload();
                            }}
                        >
                            Reload application
                        </button>
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}
