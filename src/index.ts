/**
 * Block registration entry point.
 */
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';
import { DashboardAttributes } from './types';

// ARCHITECTURAL NOTE: 
// TypeScript expects `title` and `category` to be present in this settings object.
// Because WordPress reads these natively from `block.json`, we bypass the outdated 
// strict types using `any` to prevent duplicating data and violating DRY principles.
registerBlockType< DashboardAttributes >( metadata.name, {
	edit: Edit,
	save: () => null,
} as any );