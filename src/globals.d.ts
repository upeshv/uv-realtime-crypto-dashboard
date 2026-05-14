/**
 * Global ambient module declarations.
 * Ensures TypeScript correctly resolves non-JS/TS assets managed by Webpack.
 */

declare module '*.scss' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}